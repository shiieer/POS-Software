def test_login_success(client, admin_credentials):
    response = client.post("/auth/login", json=admin_credentials)

    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert data["username"] == admin_credentials["username"]
    assert data["role"] == "admin"
    assert "access_token" in data


def test_login_wrong_password(client, admin_credentials):
    response = client.post(
        "/auth/login",
        json={"username": admin_credentials["username"], "password": "wrong"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"


def test_me_requires_auth(client):
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_me_success(client, admin_headers, admin_credentials):
    response = client.get("/auth/me", headers=admin_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == admin_credentials["username"]
    assert data["role"] == "admin"
    assert data["is_active"] is True


def test_login_empty_username(client, admin_credentials):
    response = client.post(
        "/auth/login", json={"username": "", "password": admin_credentials["password"]}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"


def test_login_empty_password(client, admin_credentials):
    response = client.post(
        "/auth/login", json={"username": admin_credentials["username"], "password": ""}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"


def test_login_missing_username(client):
    response = client.post("/auth/login", json={"password": "admin123"})

    assert response.status_code == 422


def test_login_missing_password(client):
    response = client.post("/auth/login", json={"username": "admin"})

    assert response.status_code == 422


def test_login_both_fields_empty(client):
    response = client.post("/auth/login", json={"username": "", "password": ""})

    assert response.status_code == 401


def test_root_endpoint(client):
    response = client.get("/")

    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["docs"] == "/docs"


def test_login_inactive_user(client, db_session):
    from app.core.security import hash_password
    from app.models.user import User, UserRole

    user = User(
        username="inactive_user",
        hashed_password=hash_password("pass123"),
        role=UserRole.STAFF,
        is_active=False,
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/auth/login",
        json={"username": "inactive_user", "password": "pass123"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "User account is inactive"


def test_get_active_staff_returns_list(client, admin_headers, staff_user):
    response = client.get("/auth/staff", headers=admin_headers)

    assert response.status_code == 200
    assert isinstance(response.json(), list)
    usernames = [u["username"] for u in response.json()]
    assert staff_user.username in usernames


def test_login_with_account_code_success(client, admin_headers):
    # Create staff user with account code
    res = client.post(
        "/users",
        headers=admin_headers,
        json={"username": "codeuser", "password": "codepass123", "role": "staff"},
    )
    assert res.status_code == 201
    code = res.json()["account_code"]
    assert code.startswith("STF-")

    # Login using account code instead of username
    login_res = client.post(
        "/auth/login",
        json={"username": code, "password": "codepass123"},
    )
    assert login_res.status_code == 200
    assert login_res.json()["username"] == "codeuser"


def test_upload_my_avatar_validation_and_success(client, staff_headers, monkeypatch):
    fake_png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 30

    # 1. Invalid content type
    res_invalid = client.post(
        "/auth/me/avatar",
        headers=staff_headers,
        files={"file": ("avatar.txt", b"plain text", "text/plain")},
    )
    assert res_invalid.status_code == 400
    assert "Only JPG, PNG, and WEBP are allowed" in res_invalid.json()["detail"]

    # 2. Empty file
    res_empty = client.post(
        "/auth/me/avatar",
        headers=staff_headers,
        files={"file": ("avatar.png", b"", "image/png")},
    )
    assert res_empty.status_code == 400
    assert "Empty file" in res_empty.json()["detail"]

    # 3. File too large (> 5 MB)
    large_data = b"x" * (5 * 1024 * 1024 + 1)
    res_large = client.post(
        "/auth/me/avatar",
        headers=staff_headers,
        files={"file": ("avatar.png", large_data, "image/png")},
    )
    assert res_large.status_code == 400
    assert "File too large" in res_large.json()["detail"]

    # 4. Successful avatar upload
    uploaded_url = "https://example.supabase.co/storage/v1/object/public/avatars/user_1/test.png"
    monkeypatch.setattr(
        "app.routers.auth.upload_bytes",
        lambda bucket, path, data, content_type, upsert=True: uploaded_url,
    )

    res_success = client.post(
        "/auth/me/avatar",
        headers=staff_headers,
        files={"file": ("avatar.png", fake_png, "image/png")},
    )
    assert res_success.status_code == 200
    data = res_success.json()
    assert data["avatar_url"] == uploaded_url

    # Check /auth/me returns the updated avatar_url
    me_res = client.get("/auth/me", headers=staff_headers)
    assert me_res.status_code == 200
    assert me_res.json()["avatar_url"] == uploaded_url
