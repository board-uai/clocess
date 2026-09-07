import { Container } from "@/ui/Container";
import { Button } from "@/ui/Button";
import { useAuth } from "@/auth";
import { useState, type SyntheticEvent } from "react";
import { changePassword } from "@/lib/api";

const FIELD =
  "w-full rounded-md border border-ink-3 bg-transparent px-4 py-3 text-[17px] text-ink transition-colors placeholder:text-ink-3 focus:border-ink-2";
const LABEL = "mb-2 block text-[15px] text-ink-2";

export function Profile() {
  const { user } = useAuth();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (pending) {
      return;
    }

    setError(null);
    setSuccess(false);
    setPending(true);

    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "something went wrong...",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <section>
      <h1 className="mb-8 text-[22px]">Settings</h1>
      {/* User Information */}
      <Container className="max-w-md">
        <p className="mb-2 text-[15px] text-ink-3">email</p>
        <p className="text-[17px]">{user.email}</p>
      </Container>
      {/* Change password */}
      <Container className="mt-5 max-w-md">
        <h2 className="mb-6 text-[17px]">Change Password</h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="block">
            <span className={LABEL}>current password</span>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
              required
              className={FIELD}
            />
          </label>
          <label className="block">
            <span className={LABEL}>new password</span>
            <input
              type="passwod"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
              className={FIELD}
            />
          </label>

          {error && (
            <p role="alert" className="text-[15px] text-ink">
              {error}
            </p>
          )}
          {success && (
            <p className="text-[15px] text-ink-2">password updated</p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="disabled:opacity-60"
          >
            Save
          </Button>
        </form>
      </Container>
    </section>
  );
}
