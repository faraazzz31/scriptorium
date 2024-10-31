import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    // Clear existing data in the correct order to respect relations
    await prisma.report.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.codeTemplate.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.user.deleteMany();

    console.log('All existing data has been deleted.');

    // Creating sample users
    const user1 = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            password: 'test123',
            firstName: 'Admin',
            lastName: 'Admin',
            role: 'ADMIN',
            avatar: 'https://example.com/avatar1.jpg',
            phone: '1234567890'
        }
    });

    const user2 = await prisma.user.create({
        data: {
            email: 'user@example.com',
            password: 'test123',
            firstName: 'User',
            lastName: 'User',
            avatar: 'https://example.com/avatar2.jpg',
            phone: '0987654321'
        }
    });

    // Creating tags
    const tag1 = await prisma.tag.create({ data: { name: 'JavaScript' } });
    const tag2 = await prisma.tag.create({ data: { name: 'Python' } });

    // Creating code templates
    const template1 = await prisma.codeTemplate.create({
        data: {
            title: 'Basic JavaScript Loop',
            code: 'for(let i = 0; i < 10; i++) { console.log(i); }',
            language: 'JavaScript',
            explanation: 'A simple loop in JavaScript that prints numbers from 0 to 9.',
            authorId: user1.id,
            tags: { connect: [{ id: tag1.id }] }
        }
    });

    const template2 = await prisma.codeTemplate.create({
        data: {
            title: 'Python Hello World',
            code: 'print("Hello, world!")',
            language: 'Python',
            explanation: 'Prints Hello, world! to the console.',
            authorId: user2.id,
            tags: { connect: [{ id: tag2.id }] }
        }
    });

    // Creating blog posts
    const post1 = await prisma.blogPost.create({
        data: {
            title: 'Introduction to JavaScript',
            description: 'An introductory post on JavaScript basics.',
            content: 'JavaScript is a versatile language...',
            authorId: user1.id,
            tags: { connect: [{ id: tag1.id }] },
            codeTemplates: { connect: [{ id: template1.id }] }
        }
    });

    const post2 = await prisma.blogPost.create({
        data: {
            title: 'Getting Started with Python',
            description: 'Learn the basics of Python programming.',
            content: 'Python is a popular programming language...',
            authorId: user2.id,
            tags: { connect: [{ id: tag2.id }] },
            codeTemplates: { connect: [{ id: template2.id }] }
        }
    });

    // Creating comments
    await prisma.comment.create({
        data: {
            content: 'Great post! Learned a lot.',
            authorId: user2.id,
            blogPostId: post1.id
        }
    });

    await prisma.comment.create({
        data: {
            content: 'Thanks for sharing!',
            authorId: user1.id,
            blogPostId: post2.id
        }
    });

    // Creating reports
    await prisma.report.create({
        data: {
            type: 'SPAM',
            reason: 'Inappropriate content',
            explanation: 'This comment is irrelevant and spammy.',
            reporterId: user1.id,
            commentId: 1
        }
    });

    console.log('Database has been seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
