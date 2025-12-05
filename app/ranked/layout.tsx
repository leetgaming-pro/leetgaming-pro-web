export default function RankedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 w-full">
			<div className="flex flex-col items-center w-full max-w-4xl mx-auto text-center">
				{children}
			</div>
		</section>
	);
}
