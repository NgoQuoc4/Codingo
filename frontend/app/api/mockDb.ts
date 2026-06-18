// Centralized mock database for Next.js API routes when Backend is offline or standalone
// File này đóng vai trò như một cơ sở dữ liệu tạm thời (in-memory) phục vụ chạy giao diện frontend độc lập không cần backend.
import { User } from '../../context/AuthContext';

// 1. Khởi tạo danh sách người dùng giả lập ban đầu (gồm học viên và quản trị viên)
export const mockUsers: User[] = [
  {
    id: 'user-id-1',
    username: 'learner',
    email: 'user@codingo.com',
    xp: 120,
    hearts: 5,
    lastHeartReset: new Date().toISOString(),
    streak: 3,
    lastActive: new Date().toISOString(),
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=learner',
    soundEffects: true,
    animations: true,
    motivationalMessages: true,
    listeningExercises: true,
    darkMode: 'dark',
    role: 'user', // Vai trò học viên thường
  },
  {
    id: 'admin-id-1',
    username: 'admin',
    email: 'admin@codingo.com',
    xp: 500,
    hearts: 5,
    lastHeartReset: new Date().toISOString(),
    streak: 10,
    lastActive: new Date().toISOString(),
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=admin',
    soundEffects: true,
    animations: true,
    motivationalMessages: true,
    listeningExercises: true,
    darkMode: 'dark',
    role: 'admin', // Vai trò quản trị viên hệ thống
  }
];

// Giả lập phiên đăng nhập hiện tại bằng cách lưu giữ thông tin user và token trong bộ nhớ RAM
export let activeSessionUser: User = mockUsers[0];
export let activeSessionToken: string = 'mock-jwt-token-learner';

// Hàm cập nhật trạng thái phiên đăng nhập (session) khi đăng nhập hoặc đăng ký thành công
export const setSession = (user: User, token: string) => {
  activeSessionUser = user;
  activeSessionToken = token;
};

// 2. Initial Mock Theory Courses
export const mockCourses = [
  {
    id: 'course-1',
    title: 'Khai báo let & const',
    category: 'variables',
    tag: 'let / const',
    shortDesc: 'Sự khác biệt giữa biến có thể thay đổi và hằng số cố định.',
    longDesc: 'Trong JavaScript/TypeScript hiện đại, chúng ta hạn chế sử dụng var. Thay vào đó, ta dùng const cho các giá trị không đổi sau khi gán, và let cho các biến có thể gán lại giá trị mới. Cả hai đều có phạm vi khối (block scope).',
    code: `// let cho phép gán lại giá trị\nlet score = 10;\nscore = 15; // Hợp lệ\n\n// const không cho phép gán lại giá trị mới\nconst maxScore = 100;\n// maxScore = 200; // Lỗi!\n\n// Tuy nhiên, thuộc tính của object/array khai báo const vẫn có thể thay đổi\nconst user = { name: "Codingo" };\nuser.name = "Google AI"; // Hợp lệ`,
    useCase: 'Sử dụng const theo mặc định và chỉ dùng let khi biết chắc chắn giá trị biến sẽ thay đổi.'
  },
  {
    id: 'course-2',
    title: 'Các kiểu dữ liệu cơ bản',
    category: 'variables',
    tag: 'Types',
    shortDesc: 'Tìm hiểu về String, Number, Boolean, Null và Undefined.',
    longDesc: 'JavaScript là ngôn ngữ định kiểu động. Các kiểu dữ liệu cơ bản bao gồm: String (Chuỗi kí tự), Number (Số thực/nguyên), Boolean (Đúng/Sai), Null (Giá trị trống có chủ ý) và Undefined (Biến chưa được định nghĩa).',
    code: `const name = "Alex"; // String (Chuỗi)\nconst xp = 250;      // Number (Số)\nconst isOnline = true; // Boolean (Logic)\n\nlet trophy = null;     // Rỗng có chủ đích\nlet badge;            // undefined (chưa gán giá trị)\n\nconsole.log(typeof xp); // Output: "number"`,
    useCase: 'Xác định cách hệ thống xử lý các phép toán (như cộng số hay ghép chuỗi).'
  },
  {
    id: 'course-3',
    title: 'Template Literals',
    category: 'variables',
    tag: '`string`',
    shortDesc: 'Cú pháp nội suy chuỗi mạnh mẽ sử dụng dấu backtick (`)',
    longDesc: 'Template Literals cho phép nối chuỗi dễ dàng và viết chuỗi nhiều dòng mà không cần ký tự đặc biệt. Để nhúng biểu thức hoặc biến vào chuỗi, sử dụng cú pháp ${expression} bên trong cặp dấu ` `.',
    code: `const username = "Học Viên";\nconst currentXp = 80;\n\n// Cách cũ: nối chuỗi bằng dấu cộng (+)\nconst greeting1 = "Chào " + username + ", bạn có " + currentXp + " XP.";\n\n// Cách mới: sử dụng template literals\nconst greeting2 = \`Chào \${username}, bạn có \${currentXp} XP.\`;\n\nconsole.log(greeting2);`,
    useCase: 'Thích hợp khi xây dựng các thông điệp động, URL API hoặc mã HTML động.'
  },
  {
    id: 'course-4',
    title: 'Hàm Mũi Tên (Arrow Function)',
    category: 'functions',
    tag: '=> syntax',
    shortDesc: 'Cú pháp khai báo hàm ngắn gọn và hiện đại bậc nhất.',
    longDesc: 'Hàm mũi tên (Arrow Function) cung cấp một cú pháp thay thế ngắn gọn cho định nghĩa hàm truyền thống. Điểm đặc biệt là nó không tự tạo ngữ cảnh `this` riêng, giúp tránh các lỗi phổ biến khi làm việc với callback và class.',
    code: `// Hàm truyền thống\nfunction multiply(a, b) {\n  return a * b;\n}\n\n// Hàm mũi tên (Đầy đủ)\nconst multiplyArrow = (a, b) => {\n  return a * b;\n};\n\n// Rút gọn: Nếu chỉ có 1 câu lệnh return, có thể bỏ qua {} và return\nconst multiplyShort = (a, b) => a * b;`,
    useCase: 'Thường dùng cho các hàm xử lý mảng ngắn gọn hoặc hàm callback trong React/Next.js.'
  },
  {
    id: 'course-5',
    title: 'Phương thức Array .map()',
    category: 'functions',
    tag: 'map()',
    shortDesc: 'Biến đổi các phần tử của mảng cũ thành mảng mới.',
    longDesc: 'Phương thức map() tạo ra một mảng mới bằng cách gọi một hàm callback trên từng phần tử của mảng ban đầu. Mảng ban đầu sẽ không bị thay đổi (tính bất biến - immutability).',
    code: `const prices = [10, 20, 30];\n\n// Biến đổi nhân đôi tất cả các giá trị\nconst doubledPrices = prices.map(price => price * 2);\n\nconsole.log(doubledPrices); // [20, 40, 60]\nconsole.log(prices);        // [10, 20, 30] (Không đổi)`,
    useCase: 'Cực kỳ phổ biến trong React khi render danh sách các component từ một mảng dữ liệu.'
  },
  {
    id: 'course-6',
    title: 'Phương thức Array .filter()',
    category: 'functions',
    tag: 'filter()',
    shortDesc: 'Lọc các phần tử của mảng thỏa mãn điều kiện cho trước.',
    longDesc: 'Phương thức filter() tạo ra một mảng mới chứa tất cả các phần tử vượt qua bài kiểm tra do hàm callback cung cấp. Nếu không có phần tử nào thỏa mãn, nó sẽ trả về một mảng rỗng.',
    code: `const userScores = [45, 80, 95, 30, 70];\n\n// Lọc ra các điểm số từ 70 trở lên\nconst passingScores = userScores.filter(score => score >= 70);\n\nconsole.log(passingScores); // [80, 95, 70]`,
    useCase: 'Dùng lọc danh sách sản phẩm theo giá, tìm kiếm dữ liệu, hoặc lọc các nhiệm vụ chưa hoàn thành.'
  },
  {
    id: 'course-7',
    title: 'Phương thức Array .reduce()',
    category: 'functions',
    tag: 'reduce()',
    shortDesc: 'Tính gộp mảng thành một giá trị duy nhất (tổng, tích, object).',
    longDesc: 'Phương thức reduce() thực thi một hàm thu gọn (reducer) trên từng phần tử của mảng, kết quả cuối cùng là một giá trị đơn lẻ (như tổng số, một chuỗi, hoặc một đối tượng tổng hợp).',
    code: `const cartItems = [\n  { name: "Sách React", price: 15 },\n  { name: "Khóa học Next.js", price: 50 },\n  { name: "Chuột Gaming", price: 25 }\n];\n\n// Tính tổng giá trị giỏ hàng (giá trị khởi đầu accumulator là 0)\nconst totalCost = cartItems.reduce((acc, item) => acc + item.price, 0);\n\nconsole.log(totalCost); // 90`,
    useCase: 'Phù hợp khi cần tính tổng điểm, gộp nhóm phần tử hoặc chuyển đổi cấu trúc mảng phức tạp.'
  },
  {
    id: 'course-8',
    title: 'Toán tử ba ngôi',
    category: 'logic',
    tag: 'condition ? x : y',
    shortDesc: 'Thay thế cho câu lệnh if...else ngắn gọn và tường minh.',
    longDesc: 'Toán tử ba ngôi là toán tử duy nhất nhận ba toán hạng: một điều kiện, dấu hỏi (?), biểu thức thực thi nếu điều kiện đúng, dấu hai chấm (:), và biểu thức thực thi nếu điều kiện sai.',
    code: `const userXp = 120;\n\n// Sử dụng if/else thông thường\nlet level1;\nif (userXp >= 100) {\n  level1 = "PRO";\n} else {\n  level1 = "BEGINNER";\n}\n\n// Sử dụng toán tử ba ngôi rút gọn\nconst level2 = userXp >= 100 ? "PRO" : "BEGINNER";`,
    useCase: 'Thường dùng để gán giá trị nhanh hoặc render giao diện có điều kiện trong React.'
  },
  {
    id: 'course-9',
    title: 'Destructuring (Phá cấu trúc)',
    category: 'logic',
    tag: '{ destructure }',
    shortDesc: 'Trích xuất nhanh các giá trị từ Object hoặc Array.',
    longDesc: 'Cú pháp Destructuring cho phép bạn giải nén các giá trị từ mảng hoặc thuộc tính từ đối tượng vào các biến riêng biệt một cách nhanh chóng và ngắn gọn hơn.',
    code: `const member = {\n  id: "U01",\n  username: "ZeroOne",\n  score: 99\n};\n\n// Phá cấu trúc Object\nconst { username, score } = member;\n\n// Phá cấu trúc Array\nconst coordinates = [10.5, 20.8];\nconst [latitude, longitude] = coordinates;`,
    useCase: 'Sử dụng rộng rãi khi nhận Props trong các component React hoặc xử lý dữ liệu từ API.'
  },
  {
    id: 'course-10',
    title: 'So sánh nghiêm ngặt (===)',
    category: 'logic',
    tag: '=== vs ==',
    shortDesc: 'Tại sao luôn luôn nên dùng === thay vì == trong Javascript.',
    longDesc: 'Toán tử == thực hiện chuyển đổi kiểu tự động trước khi so sánh (coercion), dẫn đến nhiều kết quả bất ngờ. Toán tử === so sánh cả giá trị và kiểu dữ liệu mà không chuyển đổi kiểu, mang lại kết quả an toàn.',
    code: `// So sánh thường (==): Chỉ so sánh giá trị\nconsole.log(5 == "5"); // true (Tự chuyển chuỗi thành số)\n\n// So sánh nghiêm ngặt (===): So sánh cả kiểu dữ liệu\nconsole.log(5 === "5"); // false (Vì Number khác String)\n\nconsole.log(null == undefined);  // true\nconsole.log(null === undefined); // false`,
    useCase: 'Luôn luôn sử dụng === và !== để so sánh các giá trị nhằm tránh các lỗi logic tiềm ẩn.'
  }
];

// 3. Initial Mock Practices
export const mockPractices = [
  {
    id: 'p1',
    title: 'JavaScript Basics',
    language: 'javascript',
    description: 'Learn the fundamentals of JavaScript, the language of the web.',
    chapters: [
      {
        id: 'c1',
        title: 'Variables & Data Types',
        lessons: [
          {
            id: 'l1',
            title: 'Introduction to Variables',
            exercises: [
              {
                type: 'multiple_choice',
                question: 'Which keyword declares a block-scoped variable that cannot be reassigned?',
                options: ['var', 'let', 'const', 'define'],
                correctAnswer: 'const',
              },
              {
                type: 'code_input',
                question: 'Fill in the blank to declare a variable named "score" with the value 100:\n\nlet score ____ 100;',
                options: [],
                correctAnswer: '=',
              },
              {
                type: 'drag_drop',
                question: 'Arrange the tokens to declare a function named "greet" that returns "hi":',
                options: ['return "hi";', 'function', 'greet()', '{', '}'],
                correctAnswer: ['function', 'greet()', '{', 'return "hi";', '}'],
              },
            ],
          },
          {
            id: 'l2',
            title: 'Primitive Types',
            exercises: [
              {
                type: 'multiple_choice',
                question: 'What is the output of: console.log(typeof null);',
                options: ['"null"', '"undefined"', '"object"', '"boolean"'],
                correctAnswer: '"object"',
              },
              {
                type: 'code_input',
                question: 'Complete the condition to check if the type of variable "x" is string:\n\nif (typeof x === "____")',
                options: [],
                correctAnswer: 'string',
              },
            ],
          },
        ],
      },
      {
        id: 'c2',
        title: 'Control Flow',
        lessons: [
          {
            id: 'l3',
            title: 'If-Else Statements',
            exercises: [
              {
                type: 'multiple_choice',
                question: 'Which comparison operator checks for strict equality (both value and type)?',
                options: ['==', '===', '=', '!='],
                correctAnswer: '===',
              },
              {
                type: 'drag_drop',
                question: 'Order the statements to construct an if-else block:',
                options: ['if (x > 5) {', 'console.log("low");', '} else {', 'console.log("high");', '}'],
                correctAnswer: ['if (x > 5) {', 'console.log("high");', '} else {', 'console.log("low");', '}'],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'p2',
    title: 'Python Core',
    language: 'python',
    description: 'Learn Python programming, perfect for beginners and data science.',
    chapters: [
      {
        id: 'c3',
        title: 'Python Basics',
        lessons: [
          {
            id: 'l4',
            title: 'Printing and Variables',
            exercises: [
              {
                type: 'multiple_choice',
                question: 'How do you insert comments in Python code?',
                options: ['// this is a comment', '# this is a comment', '/* this is a comment */', '-- this is a comment'],
                correctAnswer: '# this is a comment',
              },
              {
                type: 'code_input',
                question: 'Fill in the function name to output "Hello" to the terminal:\n\n____("Hello")',
                options: [],
                correctAnswer: 'print',
              },
              {
                type: 'drag_drop',
                question: 'Arrange the tokens to declare a function "add" that returns x + y:',
                options: ['return x + y', 'def', 'add(x, y):'],
                correctAnswer: ['def', 'add(x, y):', 'return x + y'],
              },
            ],
          },
          {
            id: 'l5',
            title: 'Python Lists',
            exercises: [
              {
                type: 'multiple_choice',
                question: 'Which list method adds an element to the end of a list?',
                options: ['add()', 'append()', 'insert()', 'push()'],
                correctAnswer: 'append()',
              },
              {
                type: 'code_input',
                question: 'Access the first element of list "items":\n\nfirst = items[____]',
                options: [],
                correctAnswer: '0',
              },
            ],
          },
        ],
      },
    ],
  },
];

// 4. Initial User Progress Records
export const mockProgress: Array<{
  id: string;
  userId: string;
  practiceId: string;
  completedLessons: string[];
  currentLessonId: string | null;
  createdAt: string;
  updatedAt: string;
}> = [
  {
    id: 'prog-1',
    userId: 'user-id-1',
    practiceId: 'p1',
    completedLessons: ['l1'],
    currentLessonId: 'l2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// 5. Các hàm bổ trợ dùng chung cho các API Router
export const helper = {
  // Hàm trung gian thực hiện chuyển tiếp (proxy) yêu cầu đến Express Backend.
  // Đọc cookie 'token' từ request của client và gán vào header Authorization: Bearer <token> gửi tới backend.
  async proxyFetch(req: Request, apiPath: string, options: RequestInit = {}) {
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      const url = `${backendUrl}${apiPath}`;
      
      // Khởi tạo đối tượng Headers
      const headers = new Headers(options.headers || {});
      headers.set('content-type', 'application/json');

      // Tự động bóc tách cookie 'token' gửi từ client
      const cookieHeader = req.headers.get('cookie');
      let token = '';
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, c) => {
          const [name, val] = c.trim().split('=');
          if (name && val) acc[name] = val;
          return acc;
        }, {} as Record<string, string>);
        token = cookies['token'] || '';
      }

      // Nếu có token trong cookie, thiết lập tiêu đề Authorization để gửi tiếp lên Backend
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.ok) {
        return { ok: true, data: await response.json() };
      }
      
      return { ok: false, error: 'Phản hồi từ Backend không thành công' };
    } catch (err) {
      // Trường hợp lỗi (ví dụ Backend bị tắt/offline), bắt lỗi để chuyển sang dữ liệu giả lập
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  },

  // Giải mã token JWT giả lập từ Cookie 'token' để lấy ra thông tin người dùng tương ứng (khi backend offline)
  authenticate(req: Request): User {
    const cookieHeader = req.headers.get('cookie');
    let token = '';
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, c) => {
        const [name, val] = c.trim().split('=');
        if (name && val) acc[name] = val;
        return acc;
      }, {} as Record<string, string>);
      token = cookies['token'] || '';
    }
    
    // Nếu không có token, mặc định lấy người dùng đăng nhập hiện tại làm dự phòng
    if (!token) return activeSessionUser;
    
    // Tìm trong danh sách mockUsers tài khoản khớp với token truyền lên
    const foundUser = mockUsers.find(u => token.includes(u.username) || token === 'mock-jwt-token-learner' && u.username === 'learner');
    if (foundUser) return foundUser;
    
    // Kiểm tra token của admin
    if (token === 'mock-jwt-token-admin') {
      const adminUser = mockUsers.find(u => u.role === 'admin');
      if (adminUser) return adminUser;
    }

    return activeSessionUser;
  }
};
