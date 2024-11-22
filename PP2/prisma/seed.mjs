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

    // Creating code templates
    const codeTemplates = [
        // Python code templates
        {
            title: 'Python Number Operations',
            code: `def number_ops(numbers):
    """Basic number operations"""
    total = sum(numbers)
    average = total / len(numbers)
    maximum = max(numbers)
    minimum = min(numbers)
    
    return {
        'total': total,
        'average': average,
        'maximum': maximum,
        'minimum': minimum
    }

# Example usage
numbers = [1, 2, 3, 4, 5]
result = number_ops(numbers)
print(result)`,
            language: 'python',
            explanation: 'Basic number operations with lists.',
            authorId: users[1].id,  // Sarah
            tags: [tags[1]] // basics
        },
        {
            title: 'Python String Manipulation',
            code: `def string_ops(text):
    """String manipulation examples"""
    # Basic operations
    upper = text.upper()
    words = text.split()
    word_count = len(words)
    chars = len(text)
    
    return {
        'uppercase': upper,
        'words': words,
        'word_count': word_count,
        'char_count': chars
    }

# Example usage
text = "Hello Python World"
result = string_ops(text)
print(result)`,
            language: 'python',
            explanation: 'Basic string manipulation functions.',
            authorId: users[2].id,  // Mike
            tags: [tags[4]] // strings
        },
        {
            title: 'Python Simple Calculator',
            code: `def calculate(a, b, operation):
    """Simple calculator"""
    if operation == '+':
        return a + b
    elif operation == '-':
        return a - b
    elif operation == '*':
        return a * b
    elif operation == '/':
        return a / b if b != 0 else "Error: Division by zero"

# Test calculations
print(calculate(10, 5, '+'))  # 15
print(calculate(10, 5, '-'))  # 5
print(calculate(10, 5, '*'))  # 50
print(calculate(10, 5, '/'))  # 2.0`,
            language: 'python',
            explanation: 'Simple calculator with basic operations.',
            authorId: users[3].id,  // Emma
            tags: [tags[1]] // basics
        },
            // JavaScript Templates
        {
            title: 'JavaScript Array Operations',
            code: `function arrayOperations(arr) {
    // Basic array operations
    const doubled = arr.map(x => x * 2);
    const evens = arr.filter(x => x % 2 === 0);
    const sum = arr.reduce((a, b) => a + b, 0);
    
    return {
        original: arr,
        doubled: doubled,
        evens: evens,
        sum: sum
    };
}

// Example usage
const numbers = [1, 2, 3, 4, 5];
console.log(arrayOperations(numbers));`,
            language: 'javascript',
            explanation: 'Basic array operations using map, filter, reduce.',
            authorId: users[4].id,  // James
            tags: [tags[2]] // arrays
        },
        {
            title: 'JavaScript String Utils',
            code: `function stringUtils(text) {
    return {
        uppercase: text.toUpperCase(),
        lowercase: text.toLowerCase(),
        length: text.length,
        words: text.split(' '),
        reversed: text.split('').reverse().join('')
    };
}

// Example usage
const text = "JavaScript is awesome";
console.log(stringUtils(text));`,
            language: 'javascript',
            explanation: 'Common string utility functions.',
            authorId: users[5].id,  // Lisa
            tags: [tags[4]] // strings
        },
        {
            title: 'JavaScript Math Helper',
            code: `function mathHelper(numbers) {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const avg = sum / numbers.length;
    const max = Math.max(...numbers);
    const min = Math.min(...numbers);
    
    return { sum, avg, max, min };
}

// Example usage
const nums = [1, 2, 3, 4, 5];
console.log(mathHelper(nums));`,
            language: 'javascript',
            explanation: 'Basic math operations helper.',
            authorId: users[6].id,  // David
            tags: [tags[7]] // math
        },

        // TypeScript Templates
        {
            title: 'TypeScript User Manager',
            code: `interface User {
    id: number;
    name: string;
    email: string;
}

class UserManager {
    private users: User[] = [];

    addUser(user: User): void {
        this.users.push(user);
    }

    findUser(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }

    listUsers(): User[] {
        return [...this.users];
    }
}

// Example usage
const manager = new UserManager();
manager.addUser({ id: 1, name: "John", email: "john@example.com" });
console.log(manager.listUsers());`,
            language: 'typescript',
            explanation: 'Simple user management with TypeScript.',
            authorId: users[7].id,  // Olivia
            tags: [tags[9]] // object-oriented
        },
        {
            title: 'TypeScript Array Utils',
            code: `function arrayUtils<T>(arr: T[]) {
    return {
        first: arr[0],
        last: arr[arr.length - 1],
        length: arr.length,
        unique: [...new Set(arr)]
    };
}

// Example usage
const numbers = [1, 2, 2, 3, 3, 4, 5];
console.log(arrayUtils(numbers));

const words = ["hello", "world", "hello"];
console.log(arrayUtils(words));`,
            language: 'typescript',
            explanation: 'Generic array utility functions.',
            authorId: users[8].id,  // Daniel
            tags: [tags[2]] // arrays
        },
        // Ruby Templates
        {
            title: 'Ruby Array Sorting',
            code: `# Basic array sorting methods
numbers = [4, 1, 3, 2, 5]

def array_sorting(arr)
  {
    original: arr,
    sorted: arr.sort,
    descending: arr.sort.reverse,
    custom: arr.sort_by { |num| -num }
  }
end

# Example usage
result = array_sorting(numbers)
puts result`,
            language: 'ruby',
            explanation: 'Different ways to sort arrays in Ruby.',
            authorId: users[1].id,  // Sarah
            tags: [tags[2]] // arrays
        },
        {
            title: 'Ruby String Counter',
            code: `def count_elements(str)
  chars = str.chars.tally
  words = str.split.length
  
  {
    char_count: chars,
    word_count: words,
    length: str.length
  }
end

# Example usage
text = "Hello Ruby World"
puts count_elements(text)`,
            language: 'ruby',
            explanation: 'Count characters and words in a string.',
            authorId: users[2].id,  // Mike
            tags: [tags[4]] // strings
        },
         // Go Templates
        {
            title: 'Go Basic Math',
            code: `package main

import "fmt"

func mathOperations(a, b int) map[string]int {
    result := map[string]int{
        "sum": a + b,
        "difference": a - b,
        "product": a * b,
    }
    return result
}

func main() {
    result := mathOperations(10, 5)
    fmt.Println(result)
}`,
            language: 'go',
            explanation: 'Basic math operations in Go.',
            authorId: users[3].id,  // Emma
            tags: [tags[7]] // math
        },
        {
            title: 'Go Slice Manipulation',
            code: `package main

import "fmt"

func sliceOps(numbers []int) {
    // Basic slice operations
    fmt.Println("Original:", numbers)
    fmt.Println("First:", numbers[0])
    fmt.Println("Length:", len(numbers))
    
    // Append
    numbers = append(numbers, 6)
    fmt.Println("After append:", numbers)
}

func main() {
    nums := []int{1, 2, 3, 4, 5}
    sliceOps(nums)
}`,
            language: 'go',
            explanation: 'Common slice operations in Go.',
            authorId: users[4].id,  // James
            tags: [tags[2]] // arrays
        },
        // PHP Templates
        {
            title: 'PHP Array Functions',
            code: `<?php
function arrayFunctions($arr) {
    $result = [
        'sum' => array_sum($arr),
        'average' => array_sum($arr) / count($arr),
        'sorted' => sort($arr),
        'reversed' => array_reverse($arr)
    ];
    
    return $result;
}

// Example usage
$numbers = [1, 2, 3, 4, 5];
print_r(arrayFunctions($numbers));
?>`,
            language: 'php',
            explanation: 'Common PHP array functions.',
            authorId: users[5].id,  // Lisa
            tags: [tags[2]] // arrays
        },
        {
            title: 'PHP String Functions',
            code: `<?php
function stringFunctions($text) {
    return [
        'uppercase' => strtoupper($text),
        'lowercase' => strtolower($text),
        'length' => strlen($text),
        'words' => str_word_count($text),
        'reversed' => strrev($text)
    ];
}

// Example usage
$text = "Hello PHP World";
print_r(stringFunctions($text));
?>`,
            language: 'php',
            explanation: 'Basic string manipulation in PHP.',
            authorId: users[6].id,  // David
            tags: [tags[4]] // strings
        },

        // Java Templates
        {
            title: 'Java Array Operations',
            code: `public class ArrayOperations {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        
        // Basic operations
        System.out.println("First: " + numbers[0]);
        System.out.println("Length: " + numbers.length);
        
        // Sum
        int sum = 0;
        for (int num : numbers) {
            sum += num;
        }
        System.out.println("Sum: " + sum);
    }
}`,
            language: 'java',
            explanation: 'Basic array operations in Java.',
            authorId: users[1].id,  // Sarah
            tags: [tags[2]] // arrays
        },
        {
            title: 'Java String Utils',
            code: `public class StringUtils {
    public static void main(String[] args) {
        String text = "Hello Java";
        
        // String operations
        System.out.println("Original: " + text);
        System.out.println("Uppercase: " + text.toUpperCase());
        System.out.println("Length: " + text.length());
        System.out.println("Contains 'Java': " + text.contains("Java"));
    }
}`,
            language: 'java',
            explanation: 'Common string operations in Java.',
            authorId: users[2].id,  // Mike
            tags: [tags[4]] // strings
        },

        // C Templates
        {
            title: 'C Array Basics',
            code: `#include <stdio.h>

int main() {
    int numbers[] = {1, 2, 3, 4, 5};
    int size = sizeof(numbers) / sizeof(numbers[0]);
    
    // Print array
    printf("Array elements: ");
    for(int i = 0; i < size; i++) {
        printf("%d ", numbers[i]);
    }
    
    // Calculate sum
    int sum = 0;
    for(int i = 0; i < size; i++) {
        sum += numbers[i];
    }
    printf("\\nSum: %d\\n", sum);
    
    return 0;
}`,
            language: 'c',
            explanation: 'Basic array operations in C.',
            authorId: users[3].id,  // Emma
            tags: [tags[2]] // arrays
        },
        {
            title: 'C Calculator',
            code: `#include <stdio.h>

int calculate(int a, int b, char op) {
    switch(op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b != 0 ? a / b : 0;
        default: return 0;
    }
}

int main() {
    printf("10 + 5 = %d\\n", calculate(10, 5, '+'));
    printf("10 - 5 = %d\\n", calculate(10, 5, '-'));
    printf("10 * 5 = %d\\n", calculate(10, 5, '*'));
    
    return 0;
}`,
            language: 'c',
            explanation: 'Simple calculator in C.',
            authorId: users[4].id,  // James
            tags: [tags[1]] // basics
        },
        // C++ Templates
        {
            title: 'C++ Vector Operations',
            code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> numbers = {1, 2, 3, 4, 5};
    
    // Vector operations
    numbers.push_back(6);
    cout << "Size: " << numbers.size() << endl;
    cout << "First: " << numbers.front() << endl;
    cout << "Last: " << numbers.back() << endl;
    
    return 0;
}`,
            language: 'cpp',
            explanation: 'Basic vector operations in C++.',
            authorId: users[5].id,  // Lisa
            tags: [tags[2]] // arrays
        },
        {
            title: 'C++ String Manipulation',
            code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string text = "Hello C++";
    
    // String operations
    cout << "Original: " << text << endl;
    cout << "Length: " << text.length() << endl;
    
    // Modify string
    text += " World";
    cout << "Modified: " << text << endl;
    
    return 0;
}`,
            language: 'cpp',
            explanation: 'String manipulation in C++.',
            authorId: users[6].id,  // David
            tags: [tags[4]] // strings
        }
    ]

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

    // Fork some templates
    const forks = await Promise.all([
        // Fork 1: Educational version
        createForkedTemplate(
            createdTemplates[0].id,  // Python Number Operations
            users[2].id,  // Mike
            {
                titlePrefix: "Educational ",
                explanationPrefix: "Step-by-step explanation of Python Number Operations"
            }
        ),
    
        // Fork 2: Beginner version
        createForkedTemplate(
            createdTemplates[0].id,  // Python Number Operations
            users[4].id,  // James
            {
                titlePrefix: "Beginner-Friendly ",
                explanationPrefix: "Simplified version of Python Operations "
            }
        ),
    
        // Fork 3: Extended version
        createForkedTemplate(
            createdTemplates[0].id,  // Python Number Operations
            users[6].id,  // David
            {
                titlePrefix: "Extended ",
                explanationPrefix: "Comprehensive version of Python Number Operations"
            }
        ),

        // TypeScript Forks
        createForkedTemplate(
            createdTemplates[6].id,
            users[7].id,  // Olivia
            {
                titlePrefix: "TypeScript User Manager",
                explanationPrefix: "Simple user management with TypeScript."
            }
        ),

        // Ruby Array Sorting Forks
        createForkedTemplate(
            createdTemplates[8].id,
            users[7].id,  // Olivia
            {
                titlePrefix: "Beginner's Guide to ",
                explanationPrefix: "Simple introduction to "
            }
        ),
        createForkedTemplate(
            createdTemplates[9].id,
            users[8].id,  // Daniel
            {
                titlePrefix: "Advanced ",
                explanationPrefix: "In-depth tutorial for "
            }
        ),

        // Go Basic Math Forks
        createForkedTemplate(
            createdTemplates[10].id,
            users[9].id,  // Sophia
            {
                titlePrefix: "Learning ",
                explanationPrefix: "Educational guide to "
            }
        ),
        createForkedTemplate(
            createdTemplates[11].id,
            users[1].id,  // Sarah
            {
                titlePrefix: "Practical ",
                explanationPrefix: "Real-world examples of "
            }
        ),

        // PHP Array Functions Forks
        createForkedTemplate(
            createdTemplates[12].id,
            users[2].id,  // Mike
            {
                titlePrefix: "Interactive ",
                explanationPrefix: "Hands-on tutorial for "
            }
        ),
        createForkedTemplate(
            createdTemplates[12].id,
            users[3].id,  // Emma
            {
                titlePrefix: "Step-by-Step ",
                explanationPrefix: "Detailed walkthrough of "
            }
        ),

        // Additional forks for String-related templates
        createForkedTemplate(
            createdTemplates[8].id,  // Ruby String Counter
            users[4].id,  // James
            {
                titlePrefix: "Simple ",
                explanationPrefix: "Easy-to-follow guide for "
            }
        ),
        createForkedTemplate(
            createdTemplates[12].id,  // PHP String Functions
            users[5].id,  // Lisa
            {
                titlePrefix: "Quick Guide to ",
                explanationPrefix: "Fast tutorial on "
            }
        ),

        createForkedTemplate(
            createdTemplates[13].id ,  // Java Array Operations
            users[6].id,  // David
            {
                titlePrefix: "Java Array Operations",
                explanationPrefix: "Basic array operations in Java."
            }
        ),

        createForkedTemplate(
            createdTemplates[14].id ,  // Java String Utils
            users[7].id,  // Olivia
            {
                titlePrefix: "Java String Utils",
                explanationPrefix: "Common string operations in Java."
            }
        ),

        // C Array Basics Forks
        createForkedTemplate(
            createdTemplates[15].id,
            users[8].id,  // Daniel
            {
                titlePrefix: "C Array Basics",
                explanationPrefix: "Basic array operations in C."
            }
        ),

        createForkedTemplate(
            createdTemplates[16].id,
            users[9].id,  // Sophia
            {
                titlePrefix: "C Calculator",
                explanationPrefix: "Simple calculator in C."
            }
        ),

        // C++ Vector Operations Forks
        createForkedTemplate(
            createdTemplates[17].id,
            users[1].id,  // Sarah
            {
                titlePrefix: "C++ Vector Operations",
                explanationPrefix: "Basic vector operations in C++."
            }
        ),

        createForkedTemplate(
            createdTemplates[18].id,
            users[2].id,  // Mike
            {
                titlePrefix: "C++ String Manipulation",
                explanationPrefix: "String manipulation in C++."
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