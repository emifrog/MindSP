export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-primary">🚒 MindSP</h1>
        <p className="text-xl text-muted-foreground">
          Plateforme SaaS de Gestion SDIS
        </p>
        <div className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Phase 0 : Structure du projet initialisée ✅
          </p>
        </div>
      </div>
    </main>
  );
}
