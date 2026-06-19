import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { comparePassword, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email i lozinka su obavezni' }, { status: 400 })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, company_name, phone, address, pib, logo_url, created_at')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (error || !user) {
      return NextResponse.json({ error: 'Pogrešan email ili lozinka' }, { status: 401 })
    }

    const valid = await comparePassword(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Pogrešan email ili lozinka' }, { status: 401 })
    }

    const { password_hash: _, ...safeUser } = user
    return NextResponse.json({ token: signToken(user.id), user: safeUser })
  } catch (e: any) {
    console.error('[login]', e)
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
