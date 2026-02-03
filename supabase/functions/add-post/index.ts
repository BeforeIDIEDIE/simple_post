// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs


//Deno환경에서 실행되게 설계하였음
import "@supabase/functions-js/edge-runtime.d.ts"
//라이브러리 불러오기
import { createClient } from '@supabase/supabase-js'
//supabase 클라이언트 생성

//CORS 헤더: 브라우저 보안 정책상, 다른 도메인(내 웹사이트)에서 이 서버(Edge Function)로 데이터를 보낼 때 필요한 헤더들
//컴네 프로토콜의 헤더같은 거라보면됨됨
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}


console.log("Add-Post 백엔드 함수가 실행되었습니다!");

//서버 함수에서 필수정의된 헤더들
Deno.serve(async (req) => {
  
  // 브라우저의 사전 요청(OPTIONS) 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 프론트엔드에서 보낸 데이터(이름, 내용) 받기
    const { author, content } = await req.json()

    // --- [백엔드 검증 로직] ---
    if (!content || content.length < 2) {
      throw new Error("type content length must be at least 2 characters.")
    }
    if(content.length>=500)
      {
      throw new Error("type content length must be less than 500 characters.")
    }
    if (content.includes("멍청이")) //나중에 금지어 목록을 DB에서 불러와서 검사하는 방식으로 개선 가능
      { // 금지어 예시
      throw new Error("inappropriate word detected in content.")
    }
    // ------------------------

    // 4. Supabase DB 연결 설정
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 5. DB에 게시글 저장
    const { data, error } = await supabase
      .from('posts')
      .insert([{ author, content }])
      .select()

    if (error) throw error

    // 성공 시 결과 반환
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    // 실패 시 에러 메시지 반환
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})