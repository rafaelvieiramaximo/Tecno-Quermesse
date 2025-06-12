"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase-client";
import {  useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { profile } from "console";
import { useUserContext } from "@/contexts/userContext";

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [stallUser, setStallUser] = useState("")
  const [stallPassword, setStallPassword] = useState("")
  const {setUserData} = useUserContext()

  const {name} = useUserContext()

  // Check for error in URL
  useEffect(() => {
    setMounted(true);
    const error = searchParams?.get("error");
    if (error) {
      toast({
        title: "Erro de autenticação",
        description:
          "Ocorreu um erro durante o processo de autenticação. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  //caixa
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login realizado com sucesso",
        description: "Você será redirecionado para o dashboard",
      });

      setEmail("");
      setPassword("");

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description:
          error.message || "Verifique suas credenciais e tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStallLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/login-booth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: stallUser,     // usa o valor do input
          password: stallPassword, // usa o valor do input
        }),
      });

      const data = await response.json();

      setUserData({
        name: data.name,
        username: data.username,
        role: data.role,
        userId: data.userId
      })

      if (data.success) {
        toast({
          title: "Login da barraca realizado",
          description: "Redirecionando para o painel da barraca...",
        });

        // Armazenar o usuário (pode ser em localStorage, context ou cookie)
        localStorage.setItem("user", JSON.stringify(data));

        router.push("/barraca_home");
        router.refresh();
      } else {
        throw new Error("Credenciais inválidas para a barraca");
      }
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login da barraca",
        description: error.message || "Verifique suas credenciais",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast({
        title: "Cadastro realizado",
        description: "Verifique seu email para confirmar o cadastro",
      });

      setEmail("");
      setPassword("");
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <Tabs defaultValue="login">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
             <TabsTrigger value="barraca">Barraca</TabsTrigger>
            </TabsList>
            <CardDescription className="pt-4">
              Acesse o sistema de gestão de Quermesses
            </CardDescription>
          </CardHeader>

          <TabsContent value="login">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {email.length > 0 && !/\S+@\S+\.\S+/.test(email) && (
                    <p className="text-red-500 text-sm">Email inválido</p>
                  )}
                  {email.length == 0 && (
                    <p className="text-red-500 text-sm">Campo obrigatório</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {password.length > 0 && password.length < 6 && (
                    <p className="text-red-500 text-sm">
                      A senha deve ter pelo menos 6 caracteres
                    </p>
                  )}
                  {password.length == 0 && (
                    <p className="text-red-500 text-sm">Campo obrigatório</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          <TabsContent value="barraca">
            <form onSubmit={handleStallLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stall-username">Usuário</Label>
                  <Input
                  id="stall-username"
                  placeholder="Digite o usuário"
                  value={stallUser}
                  onChange={(e) => setStallUser(e.target.value)}
                  required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stall-password">Senha</Label>
                  <Input
                    id="stall-password"
                    type="password"
                    value={stallPassword}
                    onChange={(e) => setStallPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar como barraca"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
