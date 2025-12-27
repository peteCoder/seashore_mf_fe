import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Seashore Financial Company</h1>
        <p className="text-muted-foreground">Microfinance Management System</p>

        {/* Test Primary Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Primary Colors Test</CardTitle>
            <CardDescription>
              Yellow in light mode, White in dark mode
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Error</Button>
            <Button variant="outline">Outline</Button>
          </CardContent>
        </Card>

        {/* Test Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription>Total Clients</CardDescription>
              <CardTitle className="text-3xl">2,000</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Active Clients</CardDescription>
              <CardTitle className="text-3xl">1,850</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Total Loans</CardDescription>
              <CardTitle className="text-3xl">350</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Total Savings</CardDescription>
              <CardTitle className="text-3xl">₦425M</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
