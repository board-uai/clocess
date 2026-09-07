import { Container } from "@/ui/Container";
import { Button } from "@/ui/Button";
import { useAuth, useSession } from "@/auth";
import { useState, type SyntheticEvent } from "react";
import { changePassword, deactivate } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const FIELD =
  "w-full rounded-md border border-ink-3 bg-transparent px-4 py-3 text-[17px] text-ink transition-colors placeholder:text-ink-3 focus:border-ink-2";
const LABEL = "mb-2 block text-[15px] text-ink-2";

export function Profile() {
  const { user } = useAuth();

  const navigate = useNavigate();
  const { refresh } = useSession();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const handleDeactivate = async (e: SyntheticEvent) => {
    if (deactivating) {
      return;
    }
    if (!window.confirm("deactivate your account? this cannot be undone.")) {
      return;
    }

    setDeactivateError(null);
    setDeactivating(true);
    try {
      await deactivate();
      navigate("/", { replace: true });
      await refresh();
    } catch (error) {
      setDeactivateError(
        error instanceof Error ? error.message : "something went wrong...",
      );
    } finally {
      setDeactivating(false);
    }
  };

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
      {/* User Information */}
      <Container className="max-w-md">
        <p className="mb-2 text-[15px] text-ink-3">username</p>
        <p className="text-[17px]">Placeholder</p>
      </Container>

      <Container className="mt-5 max-w-md">
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
            <p role="alert" className="text-[15px] text-red-400">
              {error}
            </p>
          )}
          {success && (
            <p className="text-[15px] text-green-400">password updated</p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="w-32 disabled:opacity-60 justify-center hover:bg-gray-200"
          >
            Save
          </Button>
        </form>
      </Container>
      {/* Placeholder button for now */}
      <Button
        type="submit"
        onClick={handleDeactivate}
        disabled={deactivating}
        className="w-50 mt-5 rounded-2xl border border-red-500 px-7 py-2.5 text-center text-[17px] text-white transition-colors hover:bg-red-600 bg-red-500"
      >
        {deactivating ? "deactivating..." : "deactivate account"}
      </Button>
      {deactivateError && (
        <p role="alert" className="text-[15px] text-red-400">
          {error}
        </p>
      )}
    </section>
  );
}
