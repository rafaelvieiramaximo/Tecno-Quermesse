import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { cardId, boothId, amount } = await req.json()

    if (!cardId || !boothId || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Buscar cartão
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('id, balance')
      .eq('id', cardId)
      .single()

    if (cardError || !card) {
      return NextResponse.json({ error: 'Cartão não encontrado' }, { status: 404 })
    }

    if (card.balance < amount) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
    }

    // Buscar barraca
    const { data: booth, error: boothError } = await supabase
      .from('booths')
      .select('id, faturamentp')
      .eq('id', boothId)
      .single()

    if (boothError || !booth) {
      return NextResponse.json({ error: 'Barraca não encontrada' }, { status: 404 })
    }

    // Executar as duas atualizações de forma transacional (simulada)
    const { error: updateCardError } = await supabase
      .from('cards')
      .update({ balance: card.balance - amount })
      .eq('id', cardId)

    if (updateCardError) {
      return NextResponse.json({ error: 'Erro ao atualizar saldo do cartão' }, { status: 500 })
    }

    const novoFaturamento = (booth.faturamentp || 0) + amount

    const { error: updateBoothError } = await supabase
      .from('booths')
      .update({ faturamentp: novoFaturamento })
      .eq('id', boothId)

    if (updateBoothError) {
      // Tentativa de rollback manual caso precise (limitado no Supabase client)
      await supabase
        .from('cards')
        .update({ balance: card.balance })
        .eq('id', cardId)

      return NextResponse.json({ error: 'Erro ao atualizar faturamento da barraca' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Pagamento efetuado com sucesso',
      newBalance: card.balance - amount,
      newFaturamento: novoFaturamento,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
