"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUserContext } from "@/contexts/userContext";

interface Item {
  id: string;
  booth_id: string;
  name: string;
  price: number;
}

export default function ProductPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { userId } = useUserContext();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from("items")
        .select("id, booth_id, name, price")
        .eq("booth_id", userId);

      if (error) {
        console.error("Erro ao carregar itens:", error.message);
      } else {
        setItems(data || []);
      }

      setLoading(false);
    };

    if (userId) {
      fetchItems();
    }
  }, [userId]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Itens da Barraca</h1>

      {loading ? (
        <p>Carregando itens...</p>
      ) : items.length === 0 ? (
        <p>Nenhum item encontrado para essa barraca.</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <caption className="sr-only">Tabela de Itens</caption>
            <thead className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold text-left text-center">
              <tr>
                <th className="px-6 py-3 border">Nome</th>
                <th className="px-6 py-3 border">Preço</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800 text-center">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border">{item.name}</td>
                  <td className="px-6 py-4 border">
                    {item.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
