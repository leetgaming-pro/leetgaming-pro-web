export default function DocsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col items-center w-full">
			<div className="w-full">
				{children}
			</div>
		</section>
	);
}
