import { NextRequest, NextResponse } from 'next/server'

const GCP_API_URL = process.env.GCP_API_URL || 'http://localhost:3000'
const GCP_API_SECRET = process.env.GCP_API_SECRET || ''

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  
  try {
    const response = await fetch(`${GCP_API_URL}/instances/${userId}/restart`, {
      method: 'POST',
      headers: {
        'X-API-Key': GCP_API_SECRET
      }
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to restart instance' }, { status: 500 })
  }
}
