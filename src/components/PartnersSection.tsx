const partners = ["Google", "Microsoft", "UNESCO", "Mastercard", "UNICEF", "Meta"];

export default function PartnersSection() {
  return (
    <section className="border-t border-border bg-card py-14">
      <div className="container text-center">
        <p className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Trusted by leading organizations
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {partners.map((name) => (
            <div
              key={name}
              className="text-xl font-bold text-muted-foreground/30 transition-colors hover:text-muted-foreground/60"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
