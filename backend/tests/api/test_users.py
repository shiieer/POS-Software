def test_create_user_success(client, admin_headers):
    response = client.post(
        "/users",
        headers=admin_headers,
        json={"username": "newstaff", "password": "staff123", "role": "staff"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newstaff"
    assert data["role"] == "staff"
    assert data["is_active"] is True
    assert data["account_code"] is not None
    assert data["account_code"].startswith("STF-")


def test_create_user_duplicate_username(client, admin_headers):
    payload = {"username": "duplicate_user", "password": "staff123", "role": "staff"}

    first = client.post("/users", headers=admin_headers, json=payload)
    assert first.status_code == 201

    second = client.post("/users", headers=admin_headers, json=payload)

    assert second.status_code == 400
    assert second.json()["detail"] == "Username already exists"


def test_create_user_requires_admin(client, staff_headers):
    response = client.post(
        "/users",
        headers=staff_headers,
        json={"username": "hacker", "password": "staff123", "role": "staff"},
    )

    assert response.status_code == 403


def test_get_users_returns_list(client, admin_headers):
    response = client.get("/users", headers=admin_headers)

    assert response.status_code == 200
    assert isinstance(response.json(), list)
    # admin user is always seeded
    assert any(u["role"] == "admin" for u in response.json())


def test_get_users_requires_admin(client, staff_headers):
    response = client.get("/users", headers=staff_headers)

    assert response.status_code == 403


def test_update_user_deactivate(client, admin_headers, staff_user):
    response = client.patch(
        f"/users/{staff_user.id}",
        headers=admin_headers,
        json={"is_active": False},
    )

    assert response.status_code == 200
    assert response.json()["is_active"] is False


def test_update_user_role(client, admin_headers, staff_user):
    response = client.patch(
        f"/users/{staff_user.id}",
        headers=admin_headers,
        json={"role": "admin"},
    )

    assert response.status_code == 200
    assert response.json()["role"] == "admin"


def test_update_user_password(client, admin_headers, staff_user):
    response = client.patch(
        f"/users/{staff_user.id}",
        headers=admin_headers,
        json={"password": "newpassword123"},
    )

    assert response.status_code == 200
    assert response.json()["username"] == staff_user.username


def test_update_user_not_found(client, admin_headers):
    response = client.patch(
        "/users/99999",
        headers=admin_headers,
        json={"username": "ghost"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_update_user_requires_admin(client, staff_headers, staff_user):
    response = client.patch(
        f"/users/{staff_user.id}",
        headers=staff_headers,
        json={"username": "hacker"},
    )

    assert response.status_code == 403
