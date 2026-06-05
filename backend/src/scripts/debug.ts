import { prisma } from "../db";

async function main() {
  console.log("--- DEBUG START ---");
  try {
    const lessonIdStr = "09525d0896ea1d6b88dc9147"; // Cần kiểm tra xem ID này có tồn tại hay không
    console.log("Tìm kiếm practice chứa lessonId:", lessonIdStr);

    const foundPractice = await prisma.practice.findFirst({
      where: {
        chapters: {
          some: {
            lessons: {
              some: {
                id: lessonIdStr,
              },
            },
          },
        },
      },
    });

    console.log(
      "Kết quả tìm kiếm:",
      foundPractice ? foundPractice.title : "Không tìm thấy",
    );
  } catch (error) {
    console.error("Lỗi khi debug:", error);
  } finally {
    await prisma.$disconnect();
    console.log("--- DEBUG END ---");
  }
}

main();
