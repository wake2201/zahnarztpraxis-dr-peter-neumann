"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { UserPlus, UserMinus, Users, Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUser, deleteUser } from "@/lib/actions";
import type { UserAccount } from "./types";

interface Props {
  users: UserAccount[];
}

export function UsersTab({ users }: Props) {
  const [isCreatingUser, startCreateUserTransition] = useTransition();
  const [isDeletingUser, startDeleteUserTransition] = useTransition();

  const [deleteUserConfirm, setDeleteUserConfirm] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [userFormError, setUserFormError] = useState("");
  const [userFormSuccess, setUserFormSuccess] = useState(false);

  useEffect(() => {
    if (!userFormSuccess) return;
    const timer = setTimeout(() => setUserFormSuccess(false), 4000);
    return () => clearTimeout(timer);
  }, [userFormSuccess]);

  const [optimisticUsers, addOptimisticDeleteUser] = useOptimistic(
    users,
    (state: UserAccount[], userIdToDelete: string) => state.filter((u) => u.id !== userIdToDelete),
  );

  function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setUserFormError("");
    setUserFormSuccess(false);
    startCreateUserTransition(async () => {
      const result = await createUser({ name: newUserName, email: newUserEmail, password: newUserPassword });
      if (result.success) {
        setUserFormSuccess(true);
        setNewUserName("");
        setNewUserEmail("");
        setNewUserPassword("");
      } else {
        setUserFormError(result.error || "Fehler beim Erstellen.");
      }
    });
  }

  function handleDeleteUser(id: string) {
    setDeleteUserConfirm(null);
    startDeleteUserTransition(async () => {
      addOptimisticDeleteUser(id);

      try {
        const result = await deleteUser(id);
        if (!result.success) {
          setUserFormError(result.error || "Fehler beim Löschen.");
        }
      } catch {
        setUserFormError("Netzwerkfehler.");
      }
    });
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center"><UserPlus className="w-5 h-5 text-primary" /></div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Neuen Mitarbeiter anlegen</h2>
            <p className="text-sm text-slate-500">Mitarbeiter können Anfragen verwalten, aber keine Benutzer erstellen.</p>
          </div>
        </div>
        <form onSubmit={handleCreateUser} className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
            <Input required value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Max Mustermann" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">E-Mail</label>
            <Input type="email" required value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="mitarbeiter@praxis.de" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Passwort (min. 8)</label>
            <div className="relative">
              <Input type={showNewUserPassword ? "text" : "password"} required minLength={8} value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="••••••••" className="pr-10" />
              <button type="button" onClick={() => setShowNewUserPassword(!showNewUserPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none" title={showNewUserPassword ? "Passwort verbergen" : "Passwort anzeigen"}>
                {showNewUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="sm:col-span-3 flex items-center gap-4">
            <Button type="submit" disabled={isCreatingUser}>
              {isCreatingUser ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Mitarbeiter erstellen
            </Button>
            {userFormError && <p className="text-sm text-red-600">{userFormError}</p>}
            {userFormSuccess && <p className="text-sm text-green-600">Mitarbeiter erfolgreich erstellt!</p>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Alle Benutzer</h2>
          <p className="text-sm text-slate-500 mt-1">{optimisticUsers.length} Benutzer registriert</p>
        </div>
        <div className="divide-y divide-slate-100">
          {optimisticUsers.map((u) => (
            <div key={u.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${u.role === "admin" ? "bg-primary/10" : "bg-slate-100"}`}>
                  {u.role === "admin" ? <Shield className="w-4 h-4 text-primary" /> : <Users className="w-4 h-4 text-slate-500" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{u.name || "Unbenannt"}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email} · {u.role === "admin" ? "Admin" : "Mitarbeiter"}</p>
                </div>
              </div>
              {u.role !== "admin" && (
                deleteUserConfirm === u.id ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(u.id)} disabled={isDeletingUser} className="w-full sm:w-auto text-sm px-3 h-9">
                      {isDeletingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : "Bestätigen"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteUserConfirm(null)} className="w-full sm:w-auto text-sm px-3 h-9">Abbrechen</Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setDeleteUserConfirm(u.id)} className="w-full sm:w-auto text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-sm px-3 h-9">
                    <UserMinus className="w-4 h-4 mr-1" />Entfernen
                  </Button>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
