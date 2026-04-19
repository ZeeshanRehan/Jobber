import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  // do stuff with prisma
 if(!body.name){
    return NextResponse.json({error: "Name is required!"}, {status: 400})
 }
 
 const joiningCode = nanoid(6);

 const squad = await prisma.squad.create({
    data:{
        name : body.name,
        joiningCode : joiningCode
    }
 })

  return NextResponse.json(squad, { status: 201 })
}