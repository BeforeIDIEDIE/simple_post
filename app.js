//npm run dev//package.json 에 정의된 명령어 실행 시 작동하는 진입점 파일
//npm run build//프로덕션 빌드 시 작동하는 진입점 파일
//npm run preview//프로덕션 빌드 결과물을 로컬에서 미리보기 할 때 작동하는 진입점 파일

// type="module" 사용 시 IIFE 불필요 (이미 격리된 스코프)
//// IIFE(Immediately Invoked Function Expression) : 즉시 실행 함수 표현식
// import.meta는 ES module에서만 사용 가능
// Vite는 import.meta.env를 통해 환경변수를 제공한다. VITE_ 접두사가 붙은 변수만 클라이언트 코드에서 접근 가능하다.
// Supabase 설정 (환경변수에서 로드)
///
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/add-post`;

const form = document.getElementById("postForm");
const authorInput = document.getElementById("authorInput");
const contentInput = document.getElementById("contentInput");
const postListEl = document.getElementById("postList");
const postCountEl = document.getElementById("postCount");

  /**
   * Supabase에서 게시글 목록을 로드한다.
   * @returns {Promise<Array<{author:string, content:string, created_at:string}>>}
   */
  async function loadPosts() {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/posts?order=created_at.desc`, {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
      });
      if (!response.ok) throw new Error("Failed to load posts");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to load posts", error);
      return [];
    }
  }

  /**
   * 게시글 목록을 로컬스토리지에 저장한다.
   * @param {Array<{author:string, content:string, createdAt:number}>} posts
   */
  function savePosts(posts) {
    // Supabase 사용 시 필요 없음 (DB가 자동으로 저장)
  }

  /**
   * 새로운 게시글을 Edge Function으로 전송한다.
   * @param {string} author
   * @param {string} content
   */
  async function addPost(author, content) {
    try {
      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
        },
        body: JSON.stringify({ author, content }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to add post");
      }

      // 성공 시 글 목록 새로고침
      const posts = await loadPosts();
      renderPosts(posts);
    } catch (error) {
      console.error("Failed to add post", error);
      alert(`오류: ${error.message}`);
    }
  }

  /**
   * 게시글 목록을 DOM에 렌더링한다.
   * @param {Array<{author:string, content:string, created_at:string}>} posts
   */
  function renderPosts(posts) {
    postListEl.innerHTML = "";
    posts.forEach((post) => {
      const wrapper = document.createElement("article");
      wrapper.className = "post";

      const header = document.createElement("div");
      header.className = "post-header";

      const author = document.createElement("span");
      author.className = "author";
      author.textContent = post.author || "이름 없음";

      const timestamp = document.createElement("span");
      timestamp.className = "timestamp";
      timestamp.textContent = formatDate(post.created_at);

      header.append(author, timestamp);

      const content = document.createElement("p");
      content.className = "content";
      content.textContent = post.content || "";

      wrapper.append(header, content);
      postListEl.appendChild(wrapper);
    });

    postCountEl.textContent = `${posts.length}개`;
  }

  /**
   * ISO 8601 형식의 타임스탐프를 보기 좋게 포맷한다.
   * @param {string} dateString
   * @returns {string}
   */
  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  /**
   * 10 미만 숫자에 0을 붙여 2자리 문자열로 만든다.
   * @param {number} value
   * @returns {string}
   */
  function pad(value) {
    return value < 10 ? `0${value}` : `${value}`;
  }

  /**
   * 폼 제출을 처리하고 게시글을 추가한다.
   * @param {SubmitEvent} event
   */
  async function handleSubmit(event) {
    event.preventDefault();
    const author = authorInput.value.trim();
    const content = contentInput.value.trim();
    if (!author || !content) {
      alert("이름과 게시글을 모두 입력해주세요.");
      return;
    }
    await addPost(author, content);
    form.reset();
    contentInput.blur();
  }

form.addEventListener("submit", handleSubmit);

// 초기 로드
(async () => {
  const posts = await loadPosts();
  renderPosts(posts);
})();
