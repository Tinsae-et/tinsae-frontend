"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHealth } from "@/lib/api";

type Health = { status: string; database: string };

export default function HealthPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHealth()
      .then((data) => setHealth(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Tinsae — System Status</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-muted-foreground">Checking backend…</p>}

          {error && <p className="text-red-600">Could not reach the backend: {error}</p>}

          {health && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Backend</span>
                <span className="font-medium text-green-600">{health.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Database</span>
                <span className="font-medium text-green-600">{health.database}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
