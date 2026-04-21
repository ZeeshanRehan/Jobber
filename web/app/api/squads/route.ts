import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { customAlphabet } from 'nanoid'
import { corsHeaders } from '../cors'

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}


export async function POST(req: NextRequest) {
  const body = await req.json()
  
  // do stuff with prisma
 if(!body.name){
    return NextResponse.json({error: "Name is required!"}, {status: 400})
 }

 const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8)

 const joiningCode = nanoid();

 const squad = await prisma.squad.create({
    data:{
        name : body.name,
        joiningCode : joiningCode
    }
 })

  return NextResponse.json(squad, { status: 201 ,headers: corsHeaders()})
}