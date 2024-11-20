import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createForkedTemplate(originalTemplateId, userId, modifications) {
    // Fetch the original template with its tags
    const originalTemplate = await prisma.codeTemplate.findUnique({
        where: { id: originalTemplateId },
        include: { tags: true }
    });

    if (!originalTemplate) {
        throw new Error(`Original template ${originalTemplateId} not found`);
    }

    return prisma.codeTemplate.create({
        data: {
            title: `${modifications.titlePrefix}${originalTemplate.title}`,
            code: modifications.code || originalTemplate.code,
            language: originalTemplate.language,
            explanation: `${modifications.explanationPrefix}${originalTemplate.explanation}`,
            author: {
                connect: { id: userId }
            },
            forkOf: {
                connect: { id: originalTemplate.id }
            },
            tags: {
                connect: originalTemplate.tags.map(tag => ({ id: tag.id }))
            }
        },
        include: {
            tags: true
        }
    });
}

async function main() {
    // Clear existing data
    await prisma.report.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.codeTemplate.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.user.deleteMany();

    console.log('All existing data has been deleted.');

    const password = await bcrypt.hash('Test123*', 10);

    // Creating 10 users (1 admin, 9 regular users)
    const users = await Promise.all([
        // Admin user
        prisma.user.create({
            data: {
                email: 'admin@example.com',
                password,
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
                avatar: 'avatars/avatar1.jpg',
                phone: '1234567890'
            }
        }),
        // Regular users
        prisma.user.create({
            data: {
                email: 'sarah@example.com',
                password,
                firstName: 'Sarah',
                lastName: 'Johnson',
                avatar: 'avatars/avatar2.png',
                phone: '2345678901'
            }
        }),
        prisma.user.create({
            data: {
                email: 'mike@example.com',
                password,
                firstName: 'Mike',
                lastName: 'Williams',
                avatar: 'avatars/avatar3.avif',
                phone: '3456789012'
            }
        }),
        prisma.user.create({
            data: {
                email: 'emma@example.com',
                password,
                firstName: 'Emma',
                lastName: 'Brown',
                avatar: 'avatars/avatar4.webp',
                phone: '4567890123'
            }
        }),
        prisma.user.create({
            data: {
                email: 'james@example.com',
                password,
                firstName: 'James',
                lastName: 'Davis',
                avatar: 'avatars/avatar5.webp',
                phone: '5678901234'
            }
        }),
        prisma.user.create({
            data: {
                email: 'lisa@example.com',
                password,
                firstName: 'Lisa',
                lastName: 'Miller',
                avatar: 'avatars/avatar1.jpg',
                phone: '6789012345'
            }
        }),
        prisma.user.create({
            data: {
                email: 'david@example.com',
                password,
                firstName: 'David',
                lastName: 'Wilson',
                avatar: 'avatars/avatar2.png',
                phone: '7890123456'
            }
        }),
        prisma.user.create({
            data: {
                email: 'olivia@example.com',
                password,
                firstName: 'Olivia',
                lastName: 'Taylor',
                avatar: 'avatars/avatar3.avif',
                phone: '8901234567'
            }
        }),
        prisma.user.create({
            data: {
                email: 'daniel@example.com',
                password,
                firstName: 'Daniel',
                lastName: 'Anderson',
                avatar: 'avatars/avatar4.webp',
                phone: '9012345678'
            }
        }),
        prisma.user.create({
            data: {
                email: 'sophia@example.com',
                password,
                firstName: 'Sophia',
                lastName: 'Martinez',
                avatar: 'avatars/avatar5.webp',
                phone: '0123456789'
            }
        })
    ]);

    // Creating tags
    const tags = await Promise.all([
        prisma.tag.create({ data: { name: 'loops' } }),
        prisma.tag.create({ data: { name: 'basics' } }),
        prisma.tag.create({ data: { name: 'arrays' } }),
        prisma.tag.create({ data: { name: 'functions' } }),
        prisma.tag.create({ data: { name: 'strings' } }),
        prisma.tag.create({ data: { name: 'algorithms' } }),
        prisma.tag.create({ data: { name: 'data structures' } }),
        prisma.tag.create({ data: { name: 'math' } }),
        prisma.tag.create({ data: { name: 'recursion' } }),
        prisma.tag.create({ data: { name: 'object-oriented' } })
    ]);

    // Code template data with correct language keys and distributed among users
    const codeTemplates = [
        {
            title: 'Python List Comprehension',
            code: 'numbers = [1, 2, 3, 4, 5]\nsquares = [x**2 for x in numbers]',
            language: 'python',
            explanation: 'Creating a new list using Python list comprehension.',
            authorId: users[1].id,  // Sarah
            tags: [tags[2]] // arrays
        },
        {
            title: 'JavaScript Arrow Function',
            code: 'const add = (a, b) => a + b;',
            language: 'javascript',
            explanation: 'Modern JavaScript arrow function syntax.',
            authorId: users[2].id,  // Mike
            tags: [tags[3]] // functions
        },
         // Python Templates
        {
            title: 'Python List Comprehension',
            code: 'numbers = [1, 2, 3, 4, 5]\nsquares = [x**2 for x in numbers]',
            language: 'python',
            explanation: 'Creating a new list using Python list comprehension.',
            authorId: users[1].id,
            tags: [tags[2]] // arrays
        },
        {
            title: 'Python Dictionary Comprehension',
            code: 'numbers = [1, 2, 3, 4, 5]\nsquare_dict = {n: n**2 for n in numbers}',
            language: 'python',
            explanation: 'Creating a dictionary using dictionary comprehension.',
            authorId: users[2].id,
            tags: [tags[6]] // data structures
        },
        {
            title: 'Python Recursive Fibonacci',
            code: `def fibonacci(n):
        if n <= 1:
            return n
        return fibonacci(n-1) + fibonacci(n-2)`,
            language: 'python',
            explanation: 'Recursive function to calculate Fibonacci numbers.',
            authorId: users[3].id,
            tags: [tags[8]] // recursion
        },
        {
            title: 'Python Quick Sort',
            code: `def quicksort(arr):
        if len(arr) <= 1:
            return arr
        pivot = arr[len(arr) // 2]
        left = [x for x in arr if x < pivot]
        middle = [x for x in arr if x == pivot]
        right = [x for x in arr if x > pivot]
        return quicksort(left) + middle + quicksort(right)`,
            language: 'python',
            explanation: 'Implementation of quicksort algorithm in Python.',
            authorId: users[4].id,
            tags: [tags[5]] // algorithms
        },

        // JavaScript Templates
        {
            title: 'JavaScript Array Methods',
            code: `const numbers = [1, 2, 3, 4, 5];
        const doubled = numbers.map(x => x * 2);
        const filtered = numbers.filter(x => x > 2);
        const sum = numbers.reduce((a, b) => a + b, 0);`,
            language: 'javascript',
            explanation: 'Common array methods in JavaScript: map, filter, and reduce.',
            authorId: users[5].id,
            tags: [tags[2]] // arrays
        },
        {
            title: 'JavaScript Promise Chain',
            code: `fetch('https://api.example.com/data')
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error(error));`,
            language: 'javascript',
            explanation: 'Working with Promises in JavaScript.',
            authorId: users[6].id,
            tags: [tags[1]] // basics
        },
        {
            title: 'JavaScript Async/Await',
            code: `async function fetchData() {
            try {
                const response = await fetch('https://api.example.com/data');
                const data = await response.json();
                return data;
            } catch (error) {
                console.error(error);
            }
        }`,
            language: 'javascript',
            explanation: 'Using async/await for asynchronous operations.',
            authorId: users[7].id,
            tags: [tags[1]] // basics
        },

        // TypeScript Templates
        {
            title: 'TypeScript Interface',
            code: `interface User {
        id: number;
        name: string;
        email: string;
        age?: number;
    }

    const user: User = {
        id: 1,
        name: "John",
        email: "john@example.com"
    };`,
            language: 'typescript',
            explanation: 'Defining and using interfaces in TypeScript.',
            authorId: users[8].id,
            tags: [tags[9]] // object-oriented
        },
        {
            title: 'TypeScript Generic Function',
            code: `function identity<T>(arg: T): T {
            return arg;
        }

        const number = identity<number>(42);
        const text = identity<string>("Hello");`,
            language: 'typescript',
            explanation: 'Using generics in TypeScript functions.',
            authorId: users[9].id,
            tags: [tags[3]] // functions
        },

        // Java Templates
        {
            title: 'Java ArrayList Operations',
            code: `ArrayList<String> list = new ArrayList<>();
        list.add("Hello");
        list.add("World");
        list.remove(0);
        String first = list.get(0);`,
            language: 'java',
            explanation: 'Basic ArrayList operations in Java.',
            authorId: users[1].id,
            tags: [tags[2]] // arrays
        },
        {
            title: 'Java Stream Operations',
            code: `List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
        int sum = numbers.stream()
                        .filter(n -> n % 2 == 0)
                        .mapToInt(Integer::intValue)
                        .sum();`,
            language: 'java',
            explanation: 'Using Java streams for data processing.',
            authorId: users[2].id,
            tags: [tags[2]] // arrays
        },

        // C++ Templates
        {
            title: 'C++ Vector Operations',
            code: `vector<int> numbers = {1, 2, 3, 4, 5};
        numbers.push_back(6);
        sort(numbers.begin(), numbers.end());
        auto it = find(numbers.begin(), numbers.end(), 3);`,
            language: 'cpp',
            explanation: 'Common vector operations in C++.',
            authorId: users[3].id,
            tags: [tags[2]] // arrays
        },
        {
            title: 'C++ Class Definition',
            code: `class Rectangle {
        private:
            int width;
            int height;
        public:
            Rectangle(int w, int h) : width(w), height(h) {}
            int area() { return width * height; }
        };`,
            language: 'cpp',
            explanation: 'Basic class definition in C++.',
            authorId: users[4].id,
            tags: [tags[9]] // object-oriented
        },
    ];

    // Create all code templates
    const createdTemplates = await Promise.all(
        codeTemplates.map(template =>
            prisma.codeTemplate.create({
                data: {
                    title: template.title,
                    code: template.code,
                    language: template.language,
                    explanation: template.explanation,
                    authorId: template.authorId,
                    tags: {
                        connect: template.tags.map(tag => ({ id: tag.id }))
                    }
                }
            })
        )
    );

    const forks = await Promise.all([
        // Fork 1: Improved Python List Comprehension
        createForkedTemplate(
            createdTemplates[0].id, // Original Python List Comprehension
            users[5].id, // Lisa
            {
                titlePrefix: "Enhanced ",
                code: `numbers = [1, 2, 3, 4, 5]
    squares = [x**2 for x in numbers if x % 2 == 0]  # Only square even numbers
    cubes = [x**3 for x in numbers if x % 2 != 0]  # Cube odd numbers`,
                explanationPrefix: "Enhanced version with conditional comprehensions. "
            }
        ),
    
        // Fork 2: Modified JavaScript Array Methods
        createForkedTemplate(
            createdTemplates[4].id, // JavaScript Array Methods
            users[6].id, // David
            {
                titlePrefix: "Advanced ",
                code: `const numbers = [1, 2, 3, 4, 5];
    const doubled = numbers.map(x => x * 2);
    const filtered = numbers.filter(x => x > 2);
    const sum = numbers.reduce((a, b) => a + b, 0);
    const average = sum / numbers.length;
    const hasLargeNumbers = numbers.some(x => x > 4);`,
                explanationPrefix: "Extended version with additional array methods. "
            }
        ),
    
        // Fork 3: TypeScript Interface with Generics
        createForkedTemplate(
            createdTemplates[7].id, // TypeScript Interface
            users[7].id, // Olivia
            {
                titlePrefix: "Generic ",
                code: `interface Container<T> {
        value: T;
        timestamp: Date;
    }
    
    interface User {
        id: number;
        name: string;
    }
    
    const userContainer: Container<User> = {
        value: { id: 1, name: "John" },
        timestamp: new Date()
    };`,
                explanationPrefix: "Generic version of the interface. "
            }
        ),
    
        // Fork 4: Enhanced Quick Sort with Pivot Selection
        createForkedTemplate(
            createdTemplates[3].id, // Python Quick Sort
            users[8].id, // Daniel
            {
                titlePrefix: "Optimized ",
                code: `def quicksort(arr):
        if len(arr) <= 1:
            return arr
        
        def choose_pivot(arr):
            mid = len(arr) // 2
            pivot = sorted([arr[0], arr[mid], arr[-1]])[1]
            return pivot
        
        pivot = choose_pivot(arr)
        left = [x for x in arr if x < pivot]
        middle = [x for x in arr if x == pivot]
        right = [x for x in arr if x > pivot]
        
        return quicksort(left) + middle + quicksort(right)`,
                explanationPrefix: "Optimized version with median-of-three pivot selection. "
            }
        ),
    
        // Fork 5: Java Stream Operations with Parallel Processing
        createForkedTemplate(
            createdTemplates[10].id, // Java Stream Operations
            users[9].id, // Sophia
            {
                titlePrefix: "Parallel ",
                code: `List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
    int sum = numbers.parallelStream()
                    .filter(n -> n % 2 == 0)
                    .mapToInt(Integer::intValue)
                    .sum();
                    
    double average = numbers.parallelStream()
                          .mapToDouble(Integer::doubleValue)
                          .average()
                          .orElse(0.0);`,
                explanationPrefix: "Parallel stream version for better performance. "
            }
        ),
    
        // Fork 6: Extended Promise Chain with Error Handling
        createForkedTemplate(
            createdTemplates[5].id, // JavaScript Promise Chain
            users[1].id, // Sarah
            {
                titlePrefix: "Robust ",
                code: `async function fetchDataWithRetry(url, maxRetries = 3) {
        for(let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network response was not ok');
                return await response.json();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }`,
                explanationPrefix: "Enhanced version with retry mechanism and better error handling. "
            }
        ),
    
        // Fork 7: C++ Vector Operations with Custom Allocator
        createForkedTemplate(
            createdTemplates[12].id, // C++ Vector Operations
            users[2].id, // Mike
            {
                titlePrefix: "Custom Allocator ",
                code: `template <typename T>
    class CustomAllocator : public std::allocator<T> {
        // Custom allocation logic
    };
    
    vector<int, CustomAllocator<int>> numbers = {1, 2, 3, 4, 5};
    numbers.push_back(6);
    sort(numbers.begin(), numbers.end());
    auto it = find(numbers.begin(), numbers.end(), 3);`,
                explanationPrefix: "Version with custom memory allocation. "
            }
        ),
    
        // Fork 8: Python Recursive Fibonacci with Memoization
        createForkedTemplate(
            createdTemplates[2].id, // Python Recursive Fibonacci
            users[3].id, // Emma
            {
                titlePrefix: "Memoized ",
                code: `def fibonacci_memo(n, memo={}):
        if n in memo:
            return memo[n]
        if n <= 1:
            return n
        memo[n] = fibonacci_memo(n-1, memo) + fibonacci_memo(n-2, memo)
        return memo[n]`,
                explanationPrefix: "Optimized version using memoization. "
            }
        ),
    
        // Fork 9: TypeScript Generic Function with Constraints
        createForkedTemplate(
            createdTemplates[8].id, // TypeScript Generic Function
            users[4].id, // James
            {
                titlePrefix: "Constrained ",
                code: `interface Lengthwise {
        length: number;
    }
    
    function loggingIdentity<T extends Lengthwise>(arg: T): T {
        console.log(arg.length);
        return arg;
    }
    
    const arr = loggingIdentity([1, 2, 3]);
    const str = loggingIdentity("hello");`,
                explanationPrefix: "Version with type constraints. "
            }
        ),
    
        // Fork 10: Java ArrayList with Custom Sorting
        createForkedTemplate(
            createdTemplates[9].id, // Java ArrayList Operations
            users[5].id, // Lisa
            {
                titlePrefix: "Custom Sorted ",
                code: `ArrayList<String> list = new ArrayList<>();
    list.add("Hello");
    list.add("World");
    list.add("Java");
    
    Collections.sort(list, (a, b) -> {
        // Custom sorting by length, then alphabetically
        if (a.length() != b.length()) {
            return a.length() - b.length();
        }
        return a.compareTo(b);
    });`,
                explanationPrefix: "Version with custom sorting implementation. "
            }
        )
    ]);

    // Creating blog posts (distributed among users)
    const posts = await Promise.all([
        prisma.blogPost.create({
            data: {
                title: 'Getting Started with Python',
                description: 'A beginner\'s guide to Python programming.',
                authorId: users[3].id,  // Emma
                tags: { connect: [{ id: tags[1].id }] },
                codeTemplates: { connect: [{ id: createdTemplates[0].id }] }
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Modern JavaScript Features',
                description: 'Exploring ES6+ features in JavaScript.',
                authorId: users[4].id,  // James
                tags: { connect: [{ id: tags[1].id }] },
                codeTemplates: { connect: [{ id: createdTemplates[1].id }] }
            }
        })
    ]);

    // Creating comments from different users
    const comments = await Promise.all([
        prisma.comment.create({
            data: {
                content: 'Great explanation! Really helped me understand the concept.',
                authorId: users[5].id,  // Lisa
                blogPostId: posts[0].id
            }
        }),
        prisma.comment.create({
            data: {
                content: 'Could you add more examples of practical applications?',
                authorId: users[6].id,  // David
                blogPostId: posts[0].id
            }
        }),
        prisma.comment.create({
            data: {
                content: 'This helped me with my project, thanks!',
                authorId: users[7].id,  // Olivia
                blogPostId: posts[1].id
            }
        })
    ]);

    // Add some reports
    await prisma.report.create({
        data: {
            type: 'COMMENT',
            reason: 'Inappropriate content',
            explanation: 'This comment is inappropriate and should be reviewed.',
            reporterId: users[8].id,  // Daniel
            commentId: comments[2].id // First comment
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