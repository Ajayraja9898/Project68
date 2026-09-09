"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !rollNumber.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            rollNumber: rollNumber.trim().toUpperCase(),
            password,
          }),
        }
      );

      const responseText = await res.text();

      console.log("REGISTER STATUS:", res.status);
      console.log("REGISTER RAW RESPONSE:", responseText);

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        alert(
          "Backend returned an invalid response. Check the server."
        );
        return;
      }

      if (!res.ok) {
        alert(data.message || "Registration Failed");
        return;
      }

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );
      }

      sessionStorage.removeItem(
        "communityAnonymousName"
      );

      const anonymousNumber = Math.floor(
        1000 + Math.random() * 9000
      );

      const anonymousName =
        `Anonymous ${anonymousNumber}`;

      sessionStorage.setItem(
        "communityAnonymousName",
        anonymousName
      );

      alert(
        `Registration Successful!\n\nYour anonymous identity is ${anonymousName}`
      );

      if (data.user?.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      alert(
        "Unable to connect to backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500">
            <span className="text-4xl font-black text-white">
              68
            </span>
          </div>

          <h1 className="text-4xl font-black text-white">
            JOIN PROJECT68
          </h1>

          <p className="mt-3 text-gray-400">
            Create your account
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="space-y-5"
        >
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            disabled={loading}
            className="w-full rounded-xl border border-white/10 bg-slate-800 p-4 text-white outline-none placeholder:text-gray-500 focus:border-violet-500"
          />

          <input
            type="text"
            placeholder="Roll Number"
            value={rollNumber}
            onChange={(e) =>
              setRollNumber(e.target.value)
            }
            disabled={loading}
            className="w-full rounded-xl border border-white/10 bg-slate-800 p-4 text-white outline-none placeholder:text-gray-500 focus:border-cyan-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            disabled={loading}
            className="w-full rounded-xl border border-white/10 bg-slate-800 p-4 text-white outline-none placeholder:text-gray-500 focus:border-violet-500"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            disabled={loading}
            className="w-full rounded-xl border border-white/10 bg-slate-800 p-4 text-white outline-none placeholder:text-gray-500 focus:border-cyan-500"
          />

          {confirmPassword && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              {password === confirmPassword ? (
                <p className="text-emerald-400">
                  ✓ Passwords match
                </p>
              ) : (
                <p className="text-red-400">
                  Passwords do not match
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 py-4 font-bold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() =>
            (window.location.href = "/")
          }
          className="mt-6 w-full rounded-xl border border-violet-400/30 py-3 font-semibold text-violet-300 transition hover:bg-violet-500/10 hover:text-white"
        >
          Back to Login
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          68 Students • Anonymous • Secure
        </p>
      </div>
    </main>
  );
}
