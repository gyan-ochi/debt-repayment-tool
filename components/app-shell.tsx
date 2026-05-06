export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="app-shell__inner">
        <header className="app-header">
          <div className="app-header__label">毎日3分で確認</div>
          <h1>借金返済×家計管理ツール</h1>
          <p>借金残高、毎日の収支、借金内訳をシンプルに記録して、3分で状況を確認できるローカル用ツールです。</p>
        </header>

        <section className="storage-notice" aria-label="保存先の案内">
          データはこの端末のブラウザにのみ保存されます。
        </section>

        {children}
      </div>
    </div>
  );
}
