interface QrisImageProps {
	src: string;
	alt: string;
	className: string;
}

export default function QrisImage({ src, alt, className }: QrisImageProps) {
	return (
		<img
			src={src}
			alt={alt}
			className={className}
			onError={(event) => {
				if (!event.currentTarget.src.endsWith("/qris.png")) {
					event.currentTarget.src = "/qris.png";
				}
			}}
		/>
	);
}
