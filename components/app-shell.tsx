export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="app-shell__inner">
        <header className="app-header">
          <div className="app-header__label">毎日3分で確認</div>
          <h1>借金返済×家計管理ツール</h1>
          <p>
            借金の残高、今月の収支、今日の支出、借金内訳を
            シンプルに記録して確認できるローカル用ツールです。
          </p>
        </header>
        {children}
      </div>
    </div>
  );
}
