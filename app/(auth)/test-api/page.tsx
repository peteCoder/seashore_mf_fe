// app/test-api/page.tsx
// Simple test page to diagnose branch loading issue

"use client";

import { getBranchesAction } from "@/actions/auth";
import { useEffect, useState } from "react";
// import { getBranchesAction } from "@/app/actions/auth";

export default function TestAPIPage() {
  const [testResults, setTestResults] = useState<any>({
    serverActionTest: null,
    directFetchTest: null,
    envCheck: null,
  });

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    console.log("🧪 Starting API Tests...");

    // Test 1: Environment Variable
    const envTest = {
      API_URL: process.env.API_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      hasEnvFile: process.env.API_URL ? "✅ YES" : "❌ NO",
    };
    console.log("1️⃣ Environment Test:", envTest);
    setTestResults((prev: any) => ({ ...prev, envCheck: envTest }));

    // Test 2: Server Action
    try {
      console.log("2️⃣ Testing Server Action...");
      const serverResult = await getBranchesAction();
      console.log("Server Action Result:", serverResult);
      setTestResults((prev: any) => ({
        ...prev,
        serverActionTest: serverResult,
      }));
    } catch (error) {
      console.error("Server Action Error:", error);
      setTestResults((prev: any) => ({
        ...prev,
        serverActionTest: { error: String(error) },
      }));
    }

    // Test 3: Direct Fetch (from browser)
    try {
      console.log("3️⃣ Testing Direct Fetch...");
      const response = await fetch("http://127.0.0.1:8000/api/branches/");
      const data = await response.json();
      console.log("Direct Fetch Result:", data);
      setTestResults((prev: any) => ({ ...prev, directFetchTest: data }));
    } catch (error) {
      console.error("Direct Fetch Error:", error);
      setTestResults((prev: any) => ({
        ...prev,
        directFetchTest: { error: String(error) },
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            🧪 Branch API Diagnostic Test
          </h1>

          <div className="space-y-6">
            {/* Test 1: Environment Variables */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                1️⃣ Environment Variables
              </h2>
              <div className="bg-gray-50 dark:bg-gray-900 rounded p-4">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(testResults.envCheck, null, 2)}
                </pre>
              </div>
              <div className="mt-3">
                {testResults.envCheck?.hasEnvFile === "✅ YES" ? (
                  <p className="text-green-600 dark:text-green-400 text-sm">
                    ✅ Environment variable is set
                  </p>
                ) : (
                  <div className="text-red-600 dark:text-red-400 text-sm">
                    <p className="font-semibold">
                      ❌ Environment variable NOT set
                    </p>
                    <p className="mt-2">
                      <strong>Fix:</strong> Create <code>.env.local</code> in
                      your Next.js root:
                    </p>
                    <pre className="bg-red-50 dark:bg-red-900/20 p-2 rounded mt-1">
                      API_URL=http://127.0.0.1:8000/api
                    </pre>
                    <p className="mt-2">Then restart your Next.js server!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Test 2: Server Action */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2️⃣ Server Action (getBranchesAction)
              </h2>
              <div className="bg-gray-50 dark:bg-gray-900 rounded p-4">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(testResults.serverActionTest, null, 2)}
                </pre>
              </div>
              <div className="mt-3">
                {testResults.serverActionTest?.success ? (
                  <p className="text-green-600 dark:text-green-400 text-sm">
                    ✅ Server action working! Found{" "}
                    {testResults.serverActionTest?.branches?.length || 0}{" "}
                    branches
                  </p>
                ) : testResults.serverActionTest?.error ? (
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    ❌ Server action failed:{" "}
                    {testResults.serverActionTest.error}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm">⏳ Testing...</p>
                )}
              </div>
            </div>

            {/* Test 3: Direct Fetch */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3️⃣ Direct API Fetch (http://127.0.0.1:8000/api/branches/)
              </h2>
              <div className="bg-gray-50 dark:bg-gray-900 rounded p-4">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(testResults.directFetchTest, null, 2)}
                </pre>
              </div>
              <div className="mt-3">
                {testResults.directFetchTest?.success ? (
                  <p className="text-green-600 dark:text-green-400 text-sm">
                    ✅ Direct fetch working! Found{" "}
                    {testResults.directFetchTest?.branches?.length || 0}{" "}
                    branches
                  </p>
                ) : testResults.directFetchTest?.error ? (
                  <div className="text-red-600 dark:text-red-400 text-sm">
                    <p className="font-semibold">
                      ❌ Direct fetch failed:{" "}
                      {testResults.directFetchTest.error}
                    </p>
                    {testResults.directFetchTest.error.includes(
                      "Failed to fetch"
                    ) && (
                      <p className="mt-2">
                        <strong>Possible causes:</strong>
                        <br />
                        • Django server not running (run: python manage.py
                        runserver)
                        <br />
                        • CORS not configured
                        <br />• Wrong URL
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">⏳ Testing...</p>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                📋 Summary & Recommendations
              </h2>
              <div className="space-y-2 text-sm">
                {!testResults.envCheck?.hasEnvFile && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                    <p className="font-semibold text-red-700 dark:text-red-300">
                      🚨 Priority: Fix environment variable
                    </p>
                    <ol className="list-decimal ml-5 mt-2 space-y-1 text-red-600 dark:text-red-400">
                      <li>
                        Create <code>.env.local</code> in Next.js root
                      </li>
                      <li>
                        Add: <code>API_URL=http://127.0.0.1:8000/api</code>
                      </li>
                      <li>Restart Next.js server (Ctrl+C then npm run dev)</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                )}

                {testResults.directFetchTest?.error && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                    <p className="font-semibold text-yellow-700 dark:text-yellow-300">
                      ⚠️ Django Backend Issue
                    </p>
                    <ol className="list-decimal ml-5 mt-2 space-y-1 text-yellow-600 dark:text-yellow-400">
                      <li>
                        Make sure Django is running: python manage.py runserver
                      </li>
                      <li>
                        Check it's accessible at
                        http://127.0.0.1:8000/api/branches/
                      </li>
                      <li>Verify CORS is configured in settings.py</li>
                    </ol>
                  </div>
                )}

                {testResults.serverActionTest?.success &&
                  testResults.serverActionTest?.branches?.length === 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                      <p className="font-semibold text-blue-700 dark:text-blue-300">
                        ℹ️ No Branches Found
                      </p>
                      <p className="mt-2 text-blue-600 dark:text-blue-400">
                        The API is working, but no branches exist. Create a
                        branch in Django admin and make sure "Is active" is
                        checked.
                      </p>
                    </div>
                  )}

                {testResults.serverActionTest?.success &&
                  testResults.serverActionTest?.branches?.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                      <p className="font-semibold text-green-700 dark:text-green-300">
                        ✅ Everything Working!
                      </p>
                      <p className="mt-2 text-green-600 dark:text-green-400">
                        Found {testResults.serverActionTest.branches.length}{" "}
                        active branch(es). Your register page should work now!
                      </p>
                      <a
                        href="/register"
                        className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Go to Register Page →
                      </a>
                    </div>
                  )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={runTests}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Re-run Tests
              </button>
              <a
                href="/register"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go to Register Page →
              </a>
            </div>
          </div>
        </div>

        {/* Console Output */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <p className="text-gray-300 text-sm mb-2">
            💡 Check your browser console (F12) for detailed logs
          </p>
        </div>
      </div>
    </div>
  );
}
