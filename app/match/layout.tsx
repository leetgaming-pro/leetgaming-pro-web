export default function MatchLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col items-center w-full py-4 md:py-6">
			<div className="w-full max-w-7xl mx-auto">
				{children}
			</div>
		</section>
	);
}
