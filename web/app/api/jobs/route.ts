import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { corsHeaders } from '../cors'


// add OPTIONS handler for preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}


async function scrapeJob(url: string) {
  try {
    const res = await fetch(url)
    const html = await res.text()
    
    const title = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1]
    const description = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1]
    
    return { company: description ?? null, position: title ?? null }
  } catch {
    return { company: null, position: null }
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
   console.log('POST /api/jobs body:', body)
  // do stuff with prisma
    if(!body.URL || !body.person || !body.joiningCode){
        return NextResponse.json({error: "Please enter all fields!"}, {status:401, headers: corsHeaders()})
    }

    const squadCode = body.joiningCode

    //get the squad code, through that get ID
    //create and then push job
    const squad = await prisma.squad.findFirst({
        where: {joiningCode : squadCode},
        select : {id : true}
    })

    if (!squad) return NextResponse.json({error : "Incorrect code!"}, {status:401, headers: corsHeaders()})

    

    //Deduplicate LOGIC:
    //get job, match and see if exist in db, 
    //if exist, dont append, 
    //if NOT exist, add to db, give success

    const currJob = body.URL
    const { company, position } = await scrapeJob(currJob)
    
    const job = await prisma.job.upsert({
        where: {
            URL_squad : {URL : body.URL, squad: squad.id }
        },
        update : {}, //do nothing if job exists in fields
        create : {
            URL : body.URL,
            pushedBy : body.person,
            squad : squad.id,
            company,
            position
        }
    })


  return NextResponse.json(job, { status: 201, headers: corsHeaders() })
}



//Route to GET the jobs in a squad
export async function GET(req:NextRequest) {
   const squadCode = req.nextUrl.searchParams.get('squadCode') 

   if (!squadCode) return NextResponse.json({error: "please enter squad code!"}, {status: 401});
   
   const jobs = await prisma.job.findMany({
    where:{ 
        inSquad : {joiningCode : squadCode},
        createdAt: { gte : new Date (Date.now() - 48 * 60 * 60 * 1000) }
        }
   })

    return NextResponse.json(jobs, {status : 200, headers : corsHeaders()})
}



