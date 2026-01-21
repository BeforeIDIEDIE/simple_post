(() => {
  const STORAGE_KEY = "simple-board-posts";

  const form = document.getElementById("postForm");
  const authorInput = document.getElementById("authorInput");
  const contentInput = document.getElementById("contentInput");
  const postListEl = document.getElementById("postList");
  const postCountEl = document.getElementById("postCount");

  /**
   * 현재 저장된 게시글 목록을 로드하고 파싱한다.
   * @returns {Array<{author:string, content:string, createdAt:number}>}
   */
  function loadPosts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (error) {
      console.error("Failed to save posts", error);
    }
  }

  /**
   * 새로운 게시글을 만들어 목록에 추가한다.
   * @param {string} author
   * @param {string} content
   */
  function addPost(author, content) {
    const posts = loadPosts();
    const next = [
      { author, content, createdAt: Date.now() },
      ...posts
    ];
    savePosts(next);
    renderPosts(next);
  }

  /**
   * 게시글 목록을 DOM에 렌더링한다.
   * @param {Array<{author:string, content:string, createdAt:number}>} posts
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
      timestamp.textContent = formatDate(post.createdAt);

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
   * UNIX 타임스탬프를 보기 좋게 포맷한다.
   * @param {number} ts
   * @returns {string}
   */
  function formatDate(ts) {
    if (!ts) return "";
    const date = new Date(ts);
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
  function handleSubmit(event) {
    event.preventDefault();
    const author = authorInput.value.trim();
    const content = contentInput.value.trim();
    if (!author || !content) {
      alert("이름과 게시글을 모두 입력해주세요.");
      return;
    }
    addPost(author, content);
    form.reset();
    contentInput.blur();
  }

  form.addEventListener("submit", handleSubmit);

  renderPosts(loadPosts());
})();
