import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * Заглушка первой страницы: каркас собран, функциональность появится следующим
 * шагом. Нужна, чтобы убедиться, что фронтенд собирается, отдаётся и рендерится.
 */
export default function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Календарь звонков</h1>
          <CardDescription>
            Рабочая основа приложения: сборка проходит, сервер отвечает, тесты и линтеры запускаются
            в CI.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            API: <code className="font-mono">{apiUrl}</code>
          </p>
          <Button className="w-fit" disabled>
            Скоро здесь будут слоты
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
