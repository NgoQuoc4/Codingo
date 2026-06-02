import { prisma } from '../db';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Helper to generate 24-character hexadecimal ObjectId strings
const randomObjectId = () => {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const practiceSeedData = [
  {
    title: 'JavaScript Basics',
    language: 'javascript',
    description: 'Learn the fundamentals of JavaScript, the language of the web.',
    chapters: [
      {
        title: 'Variables & Data Types',
        lessons: [
          {
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
        title: 'Control Flow',
        lessons: [
          {
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
    title: 'Python Core',
    language: 'python',
    description: 'Learn Python programming, perfect for beginners and data science.',
    chapters: [
      {
        title: 'Python Basics',
        lessons: [
          {
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

const theoryCoursesSeedData = [
  {
    title: 'Khai báo let & const',
    category: 'variables',
    tag: 'let / const',
    shortDesc: 'Sự khác biệt giữa biến có thể thay đổi và hằng số cố định.',
    longDesc: 'Trong JavaScript/TypeScript hiện đại, chúng ta hạn chế sử dụng var. Thay vào đó, ta dùng const cho các giá trị không đổi sau khi gán, và let cho các biến có thể gán lại giá trị mới. Cả hai đều có phạm vi khối (block scope).',
    code: `// let cho phép gán lại giá trị
let score = 10;
score = 15; // Hợp lệ

// const không cho phép gán lại giá trị mới
const maxScore = 100;
// maxScore = 200; // Lỗi!

// Tuy nhiên, thuộc tính của object/array khai báo const vẫn có thể thay đổi
const user = { name: "Codingo" };
user.name = "Google AI"; // Hợp lệ`,
    useCase: 'Sử dụng const theo mặc định và chỉ dùng let khi biết chắc chắn giá trị biến sẽ thay đổi.'
  },
  {
    title: 'Các kiểu dữ liệu cơ bản',
    category: 'variables',
    tag: 'Types',
    shortDesc: 'Tìm hiểu về String, Number, Boolean, Null và Undefined.',
    longDesc: 'JavaScript là ngôn ngữ định kiểu động. Các kiểu dữ liệu cơ bản bao gồm: String (Chuỗi kí tự), Number (Số thực/nguyên), Boolean (Đúng/Sai), Null (Giá trị trống có chủ ý) và Undefined (Biến chưa được định nghĩa).',
    code: `const name = "Alex"; // String (Chuỗi)
const xp = 250;      // Number (Số)
const isOnline = true; // Boolean (Logic)

let trophy = null;     // Rỗng có chủ đích
let badge;            // undefined (chưa gán giá trị)

console.log(typeof xp); // Output: "number"`,
    useCase: 'Xác định cách hệ thống xử lý các phép toán (như cộng số hay ghép chuỗi).'
  },
  {
    title: 'Template Literals',
    category: 'variables',
    tag: '`string`',
    shortDesc: 'Cú pháp nội suy chuỗi mạnh mẽ sử dụng dấu backtick (`)',
    longDesc: 'Template Literals cho phép nối chuỗi dễ dàng và viết chuỗi nhiều dòng mà không cần ký tự đặc biệt. Để nhúng biểu thức hoặc biến vào chuỗi, sử dụng cú pháp ${expression} bên trong cặp dấu ` `.',
    code: `const username = "Học Viên";
const currentXp = 80;

// Cách cũ: nối chuỗi bằng dấu cộng (+)
const greeting1 = "Chào " + username + ", bạn có " + currentXp + " XP.";

// Cách mới: sử dụng template literals
const greeting2 = \`Chào \${username}, bạn có \${currentXp} XP.\`;

console.log(greeting2);`,
    useCase: 'Thích hợp khi xây dựng các thông điệp động, URL API hoặc mã HTML động.'
  },
  {
    title: 'Hàm Mũi Tên (Arrow Function)',
    category: 'functions',
    tag: '=> syntax',
    shortDesc: 'Cú pháp khai báo hàm ngắn gọn và hiện đại bậc nhất.',
    longDesc: 'Hàm mũi tên (Arrow Function) cung cấp một cú pháp thay thế ngắn gọn cho định nghĩa hàm truyền thống. Điểm đặc biệt là nó không tự tạo ngữ cảnh `this` riêng, giúp tránh các lỗi phổ biến khi làm việc với callback và class.',
    code: `// Hàm truyền thống
function multiply(a, b) {
  return a * b;
}

// Hàm mũi tên (Đầy đủ)
const multiplyArrow = (a, b) => {
  return a * b;
};

// Rút gọn: Nếu chỉ có 1 câu lệnh return, có thể bỏ qua {} và return
const multiplyShort = (a, b) => a * b;`,
    useCase: 'Thường dùng cho các hàm xử lý mảng ngắn gọn hoặc hàm callback trong React/Next.js.'
  },
  {
    title: 'Phương thức Array .map()',
    category: 'functions',
    tag: 'map()',
    shortDesc: 'Biến đổi các phần tử của mảng cũ thành mảng mới.',
    longDesc: 'Phương thức map() tạo ra một mảng mới bằng cách gọi một hàm callback trên từng phần tử của mảng ban đầu. Mảng ban đầu sẽ không bị thay đổi (tính bất biến - immutability).',
    code: `const prices = [10, 20, 30];

// Biến đổi nhân đôi tất cả các giá trị
const doubledPrices = prices.map(price => price * 2);

console.log(doubledPrices); // [20, 40, 60]
console.log(prices);        // [10, 20, 30] (Không đổi)`,
    useCase: 'Cực kỳ phổ biến trong React khi render danh sách các component từ một mảng dữ liệu.'
  },
  {
    title: 'Phương thức Array .filter()',
    category: 'functions',
    tag: 'filter()',
    shortDesc: 'Lọc các phần tử của mảng thỏa mãn điều kiện cho trước.',
    longDesc: 'Phương thức filter() tạo ra một mảng mới chứa tất cả các phần tử vượt qua bài kiểm tra do hàm callback cung cấp. Nếu không có phần tử nào thỏa mãn, nó sẽ trả về một mảng rỗng.',
    code: `const userScores = [45, 80, 95, 30, 70];

// Lọc ra các điểm số từ 70 trở lên
const passingScores = userScores.filter(score => score >= 70);

console.log(passingScores); // [80, 95, 70]`,
    useCase: 'Dùng lọc danh sách sản phẩm theo giá, tìm kiếm dữ liệu, hoặc lọc các nhiệm vụ chưa hoàn thành.'
  },
  {
    title: 'Phương thức Array .reduce()',
    category: 'functions',
    tag: 'reduce()',
    shortDesc: 'Tính gộp mảng thành một giá trị duy nhất (tổng, tích, object).',
    longDesc: 'Phương thức reduce() thực thi một hàm thu gọn (reducer) trên từng phần tử của mảng, kết quả cuối cùng là một giá trị đơn lẻ (như tổng số, một chuỗi, hoặc một đối tượng tổng hợp).',
    code: `const cartItems = [
  { name: "Sách React", price: 15 },
  { name: "Khóa học Next.js", price: 50 },
  { name: "Chuột Gaming", price: 25 }
];

// Tính tổng giá trị giỏ hàng (giá trị khởi đầu accumulator là 0)
const totalCost = cartItems.reduce((acc, item) => acc + item.price, 0);

console.log(totalCost); // 90`,
    useCase: 'Phù hợp khi cần tính tổng điểm, gộp nhóm phần tử hoặc chuyển đổi cấu trúc mảng phức tạp.'
  },
  {
    title: 'Toán tử ba ngôi',
    category: 'logic',
    tag: 'condition ? x : y',
    shortDesc: 'Thay thế cho câu lệnh if...else ngắn gọn và tường minh.',
    longDesc: 'Toán tử ba ngôi là toán tử duy nhất nhận ba toán hạng: một điều kiện, dấu hỏi (?), biểu thức thực thi nếu điều kiện đúng, dấu hai chấm (:), và biểu thức thực thi nếu điều kiện sai.',
    code: `const userXp = 120;

// Sử dụng if/else thông thường
let level1;
if (userXp >= 100) {
  level1 = "PRO";
} else {
  level1 = "BEGINNER";
}

// Sử dụng toán tử ba ngôi rút gọn
const level2 = userXp >= 100 ? "PRO" : "BEGINNER";`,
    useCase: 'Thường dùng để gán giá trị nhanh hoặc render giao diện có điều kiện trong React.'
  },
  {
    title: 'Destructuring (Phá cấu trúc)',
    category: 'logic',
    tag: '{ destructure }',
    shortDesc: 'Trích xuất nhanh các giá trị từ Object hoặc Array.',
    longDesc: 'Cú pháp Destructuring cho phép bạn giải nén các giá trị từ mảng hoặc thuộc tính từ đối tượng vào các biến riêng biệt một cách nhanh chóng và ngắn gọn hơn.',
    code: `const member = {
  id: "U01",
  username: "ZeroOne",
  score: 99
};

// Phá cấu trúc Object
const { username, score } = member;

// Phá cấu trúc Array
const coordinates = [10.5, 20.8];
const [latitude, longitude] = coordinates;`,
    useCase: 'Sử dụng rộng rãi khi nhận Props trong các component React hoặc xử lý dữ liệu từ API.'
  },
  {
    title: 'So sánh nghiêm ngặt (===)',
    category: 'logic',
    tag: '=== vs ==',
    shortDesc: 'Tại sao luôn luôn nên dùng === thay vì == trong Javascript.',
    longDesc: 'Toán tử == thực hiện chuyển đổi kiểu tự động trước khi so sánh (coercion), dẫn đến nhiều kết quả bất ngờ. Toán tử === so sánh cả giá trị và kiểu dữ liệu mà không chuyển đổi kiểu, mang lại kết quả an toàn.',
    code: `// So sánh thường (==): Chỉ so sánh giá trị
console.log(5 == "5"); // true (Tự chuyển chuỗi thành số)

// So sánh nghiêm ngặt (===): So sánh cả kiểu dữ liệu
console.log(5 === "5"); // false (Vì Number khác String)

console.log(null == undefined);  // true
console.log(null === undefined); // false`,
    useCase: 'Luôn luôn sử dụng === và !== để so sánh các giá trị nhằm tránh các lỗi logic tiềm ẩn.'
  }
];

async function seed() {
  try {
    console.log('Clearing old database records...');
    await prisma.progress.deleteMany({});
    await prisma.practice.deleteMany({});
    await prisma.course.deleteMany({});
    
    console.log('Seeding practices...');
    const mappedPractices = practiceSeedData.map((practice) => ({
      title: practice.title,
      language: practice.language,
      description: practice.description,
      chapters: practice.chapters.map((chapter) => ({
        id: randomObjectId(),
        title: chapter.title,
        lessons: chapter.lessons.map((lesson) => ({
          id: randomObjectId(),
          title: lesson.title,
          exercises: lesson.exercises.map((exercise) => ({
            type: exercise.type,
            question: exercise.question,
            options: exercise.options,
            correctAnswer: exercise.correctAnswer
          }))
        }))
      }))
    }));

    for (const practiceData of mappedPractices) {
      await prisma.practice.create({
        data: practiceData
      });
      console.log(`Successfully seeded practice: ${practiceData.title} (${practiceData.language})`);
    }

    console.log('Seeding theory courses...');
    for (const courseData of theoryCoursesSeedData) {
      await prisma.course.create({
        data: courseData
      });
      console.log(`Successfully seeded theory course: ${courseData.title}`);
    }

    console.log('Seeding admin account...');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@codingo.com' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@codingo.com',
        password: adminPasswordHash,
        xp: 120,
        hearts: 5,
        streak: 5,
        role: 'admin',
        lastHeartReset: new Date(),
        lastActive: new Date()
      }
    });
    console.log('Admin account seeded successfully: admin@codingo.com / admin123');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
