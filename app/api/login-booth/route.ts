import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username e senha são obrigatórios' }, { status: 400 })
    }

    const { data: booth, error } = await supabase
      .from('booths')
      .select('id, username, password, name')
      .eq('username', username)
      .single()

    if (error || !booth) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    // Comparação simples, sem bcrypt pois você pediu sem criptografia
    if (password !== booth.password) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      userId: booth.id,
      role: 'booth',
      username: booth.username,
      name: booth.name
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
