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
        }),
        prisma.user.create({
            data: {
                email: 'john@example.com',
                password,
                firstName: 'John',
                lastName: 'Smith',
                avatar: 'avatars/avatar1.jpg',
                phone: '1234567890'
            }
        }),
        prisma.user.create({
            data: {
                email: 'janis@example.com',
                password,
                firstName: 'Janis',
                lastName: 'Joplin',
                avatar: 'avatars/avatar5.webp',
                phone: '1234567890'
            }
        }),
        prisma.user.create({
            data: {
                email: 'faraaz@example.com',
                password,
                firstName: 'Faraaz',
                lastName: 'Ahmed',
                avatar: 'avatars/avatar4.webp',
                phone: '1234567890'
            }
        }),
        prisma.user.create({
            data: {
                email: 'christoffer@example.com',
                password,
                firstName: 'Christoffer',
                lastName: 'Tan',
                avatar: 'avatars/avatar3.avif',
                phone: '1234567890'
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
        },

        // Bash Templates
        {
            title: 'Bash Scripting Basics',
            code: `#!/bin/bash
echo "Hello, World!"`,
            language: 'bash',
            explanation: 'Simple Bash script to print a message.',
            authorId: users[8].id,  // Olivia
            tags: [tags[1]] // basics
        },
        {
            title: 'Bash Addition Script',
            code: `#!/bin/bash
mapfile -t input
a=\${input[0]}
b=\${input[1]}
echo $((a + b))`
            ,
            language: 'bash',
            explanation: 'Bash script to add two numbers.',
            authorId: users[7].id,  // Olivia
            tags: [tags[1]] // basics
        },

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

    // Additional blog posts
    const additionalPosts = await Promise.all([
        prisma.blogPost.create({
            data: {
                title: 'Mastering TypeScript Generics',
                description: 'Deep dive into TypeScript generics with practical examples. Learn how to write flexible, reusable code using generic types, constraints, and utility types. Perfect for intermediate developers looking to level up their TypeScript skills.',
                authorId: users[7].id, // Olivia
                tags: { connect: [{ id: tags[9].id }, { id: tags[1].id }] }, // object-oriented, basics
                codeTemplates: { connect: [{ id: createdTemplates[6].id }] }, // TypeScript User Manager
                upvotes: 45,
                downvotes: 3
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Advanced Array Manipulation in Ruby',
                description: 'Comprehensive guide to working with arrays in Ruby. Covers sorting algorithms, filtering techniques, and performance optimization strategies. Includes real-world examples and common pitfalls to avoid when handling large datasets.',
                authorId: users[1].id, // Sarah
                tags: { connect: [{ id: tags[2].id }, { id: tags[5].id }] }, // arrays, algorithms
                codeTemplates: { connect: [{ id: createdTemplates[8].id }] }, // Ruby Array Sorting
                upvotes: 67,
                downvotes: 5
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Building Efficient Data Structures in Go',
                description: 'Learn how to implement and optimize custom data structures in Go. This comprehensive guide covers slices, maps, and custom implementations of stacks, queues, and linked lists. Essential reading for Go developers working on performance-critical applications.',
                authorId: users[3].id, // Emma
                tags: { connect: [{ id: tags[6].id }, { id: tags[5].id }] }, // data structures, algorithms
                codeTemplates: { connect: [{ id: createdTemplates[11].id }] }, // Go Slice Manipulation
                upvotes: 89,
                downvotes: 7
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'String Processing Best Practices in PHP',
                description: 'Everything you need to know about string manipulation in PHP. From basic operations to advanced text processing, Unicode handling, and regular expressions. Includes performance comparisons and best practices for different scenarios.',
                authorId: users[5].id, // Lisa
                tags: { connect: [{ id: tags[4].id }, { id: tags[1].id }] }, // strings, basics
                codeTemplates: { connect: [{ id: createdTemplates[13].id }] }, // PHP String Functions
                upvotes: 34,
                downvotes: 2
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Recursive Algorithms in Java',
                description: 'Master recursion in Java with practical examples. This guide covers fundamental concepts, optimization techniques, and common recursive patterns. Learn when to use recursion and how to convert recursive solutions to iterative ones for better performance.',
                authorId: users[2].id, // Mike
                tags: { connect: [{ id: tags[8].id }, { id: tags[5].id }] }, // recursion, algorithms
                codeTemplates: { connect: [{ id: createdTemplates[14].id }] }, // Java String Utils
                upvotes: 112,
                downvotes: 9
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Memory Management in C++',
                description: 'In-depth exploration of memory management in modern C++. Covers smart pointers, RAII pattern, move semantics, and best practices for preventing memory leaks. Essential knowledge for writing robust C++ applications.',
                authorId: users[6].id, // David
                tags: { connect: [{ id: tags[9].id }, { id: tags[6].id }] }, // object-oriented, data structures
                codeTemplates: { connect: [{ id: createdTemplates[17].id }] }, // C++ Vector Operations
                upvotes: 78,
                downvotes: 4
            }
        })
    ]);

    // Helper function to get random past date within the last year
    function getRandomPastDate() {
        const now = new Date();
        const pastDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        return pastDate;
    }

// Additional blog posts with timestamps
    const morePosts = await Promise.all([
        // 1. Python Machine Learning Blog
        prisma.blogPost.create({
            data: {
                title: 'Introduction to Machine Learning with Python',
                description: 'A comprehensive guide to getting started with machine learning using Python and scikit-learn. Covers basic concepts, data preprocessing, model selection, and evaluation metrics with practical examples.',
                authorId: users[2].id, // Mike
                tags: { connect: [{ id: tags[5].id }, { id: tags[7].id }] }, // algorithms, math
                codeTemplates: { connect: [{ id: createdTemplates[0].id }] },
                upvotes: 156,
                downvotes: 12,
                createdAt: new Date('2024-01-15T08:30:00Z')
            }
        }),

        // 2. JavaScript Async Programming
        prisma.blogPost.create({
            data: {
                title: 'Mastering Asynchronous JavaScript',
                description: 'Deep dive into async/await, Promises, and callback patterns. Learn how to write clean, efficient asynchronous code and avoid common pitfalls in JavaScript applications.',
                authorId: users[4].id, // James
                tags: { connect: [{ id: tags[1].id }, { id: tags[3].id }] }, // basics, functions
                codeTemplates: { connect: [{ id: createdTemplates[4].id }] },
                upvotes: 234,
                downvotes: 18,
                createdAt: new Date('2024-02-01T15:45:00Z')
            }
        }),

        // 3. Ruby Metaprogramming
        prisma.blogPost.create({
            data: {
                title: 'Advanced Ruby Metaprogramming Techniques',
                description: 'Explore the power of Ruby metaprogramming. Learn about method_missing, define_method, and other dynamic programming features that make Ruby unique.',
                authorId: users[1].id, // Sarah
                tags: { connect: [{ id: tags[9].id }, { id: tags[3].id }] }, // object-oriented, functions
                codeTemplates: { connect: [{ id: createdTemplates[8].id }] },
                upvotes: 178,
                downvotes: 15,
                createdAt: new Date('2024-02-15T11:20:00Z')
            }
        }),

        // Continue with more posts...
        // 4. Go Concurrency Patterns
        prisma.blogPost.create({
            data: {
                title: 'Practical Go Concurrency Patterns',
                description: 'Understanding goroutines, channels, and common concurrency patterns in Go. Includes real-world examples and best practices for writing concurrent applications.',
                authorId: users[3].id, // Emma
                tags: { connect: [{ id: tags[5].id }, { id: tags[6].id }] },
                codeTemplates: { connect: [{ id: createdTemplates[10].id }] },
                upvotes: 198,
                downvotes: 14,
                createdAt: new Date('2024-03-01T09:15:00Z')
            }
        }),
        // Continuing the morePosts array with posts 5-15
        prisma.blogPost.create({
            data: {
                title: 'Design Patterns in Modern PHP',
                description: 'An in-depth exploration of implementing design patterns in PHP 8.x. Covers Factory, Singleton, Observer, and other essential patterns with real-world applications. Includes performance considerations and best practices for enterprise applications.',
                authorId: users[5].id, // Lisa
                tags: { connect: [{ id: tags[9].id }, { id: tags[5].id }] },
                codeTemplates: { connect: [{ id: createdTemplates[12].id }] },
                upvotes: 167,
                downvotes: 13,
                createdAt: new Date('2024-03-15T14:30:00Z')
            }
        }),

        prisma.blogPost.create({
            data: {
                title: 'Advanced TypeScript Type System',
                description: 'Master TypeScript\'s advanced type system features. Deep dive into conditional types, mapped types, template literal types, and type inference. Learn how to create flexible, type-safe APIs and libraries.',
                authorId: users[7].id, // Olivia
                tags: { connect: [{ id: tags[9].id }, { id: tags[1].id }] },
                codeTemplates: { connect: [{ id: createdTemplates[6].id }] },
                upvotes: 289,
                downvotes: 21,
                createdAt: new Date('2024-03-20T09:45:00Z')
            }
        }),

        prisma.blogPost.create({
            data: {
                title: 'Performance Optimization in C++',
                description: 'Advanced techniques for optimizing C++ applications. Covers memory layout, cache efficiency, SIMD instructions, and compiler optimizations. Learn how to profile and improve your C++ code for maximum performance.',
                authorId: users[6].id, // David
                tags: { connect: [{ id: tags[5].id }, { id: tags[6].id }] },
                codeTemplates: { connect: [{ id: createdTemplates[17].id }] },
                upvotes: 345,
                downvotes: 25,
                createdAt: new Date('2024-03-25T16:20:00Z')
            }
        }),

        prisma.blogPost.create({
            data: {
                title: 'Building Microservices with Go',
                description: 'Comprehensive guide to building scalable microservices in Go. Covers service discovery, load balancing, circuit breakers, and distributed tracing. Includes real-world examples and deployment strategies.',
                authorId: users[3].id, // Emma
                tags: { connect: [{ id: tags[5].id }, { id: tags[3].id }] },
                codeTemplates: { connect: [{ id: createdTemplates[10].id }] },
                upvotes: 278,
                downvotes: 19,
                createdAt: new Date('2024-04-01T11:15:00Z')
            }
        }),

        prisma.blogPost.create({
            data: {
                title: 'Functional Programming in JavaScript',
                description: 'Learn functional programming principles using modern JavaScript. Explore pure functions, immutability, function composition, and common FP patterns. Includes practical examples using popular FP libraries.',
                authorId: users[4].id, // James
                tags: { connect: [{ id: tags[3].id }, { id: tags[1].id }] },
                codeTemplates: { connect: [{ id: createdTemplates[4].id }] },
                upvotes: 198,
                downvotes: 15,
                createdAt: new Date('2024-04-05T13:40:00Z')
            }
        }),

        prisma.blogPost.create({
            data: {
                title: 'Ruby on Rails Performance Tuning',
                description: 'Advanced techniques for optimizing Rails applications. Covers database optimization, caching strategies, background jobs, and monitoring. Learn how to identify and fix performance bottlenecks.',
                authorId: users[1].id, // Sarah
                tags: { connect: [{ id: tags[5].id }, { id: tags[6].id }] },
                codeTemplates: { connect: [{ id: createdTemplates[8].id }] },
                upvotes: 223,
                downvotes: 17,
                createdAt: new Date('2024-04-10T10:30:00Z')
            }
        }),

        prisma.blogPost.create({
            data: {
                title: 'Modern C++ Game Development',
                description: 'Building game engines with modern C++. Covers rendering, physics, input handling, and game loop architecture. Learn how to create efficient and maintainable game systems.',
                authorId: users[6].id, // David
                tags: { connect: [{ id: tags[9].id }, { id: tags[5].id }] },
                codeTemplates: { connect: [{ id: createdTemplates[18].id }] },
                upvotes: 312,
                downvotes: 23,
                createdAt: new Date('2024-04-15T15:20:00Z')
            }
        }),

        prisma.blogPost.create({
            data: {
                title: 'Python Data Analysis with Pandas',
                description: 'Mastering data analysis using Python and Pandas. Covers data cleaning, transformation, visualization, and statistical analysis. Includes real-world datasets and practical examples.',
                authorId: users[2].id, // Mike
                tags: { connect: [{ id: tags[7].id }, { id: tags[5].id }] },
                codeTemplates: { connect: [{ id: createdTemplates[0].id }] },
                upvotes: 267,
                downvotes: 18,
                createdAt: new Date('2024-04-20T09:15:00Z')
            }
        }),

        prisma.blogPost.create({
            data: {
                title: 'Secure Coding Practices in PHP',
                description: 'Essential security practices for PHP developers. Covers XSS prevention, SQL injection, CSRF protection, and secure authentication. Learn how to build secure web applications.',
                authorId: users[5].id, // Lisa
                tags: { connect: [{ id: tags[1].id }, { id: tags[3].id }] },
                codeTemplates: { connect: [{ id: createdTemplates[12].id }] },
                upvotes: 245,
                downvotes: 16,
                createdAt: new Date('2024-04-25T14:45:00Z')
            }
        }),

        prisma.blogPost.create({
            data: {
                title: 'Building React Native Applications',
                description: 'Complete guide to developing cross-platform mobile applications with React Native. Covers component design, navigation, state management, and native modules. Includes deployment and optimization strategies.',
                authorId: users[8].id, // Daniel
                tags: { connect: [{ id: tags[9].id }, { id: tags[3].id }] },
                codeTemplates: { connect: [{ id: createdTemplates[4].id }] },
                upvotes: 334,
                downvotes: 24,
                createdAt: new Date('2024-04-30T11:30:00Z')
            }
        }),

        prisma.blogPost.create({
            data: {
                title: 'System Design with Go',
                description: 'Advanced system design patterns implemented in Go. Learn how to build scalable, distributed systems with proper error handling, logging, and monitoring. Includes case studies of real-world architectures.',
                authorId: users[3].id, // Emma
                tags: { connect: [{ id: tags[5].id }, { id: tags[6].id }] },
                codeTemplates: { connect: [{ id: createdTemplates[10].id }] },
                upvotes: 289,
                downvotes: 21,
                createdAt: new Date('2024-05-05T16:15:00Z')
            }
        }),

        prisma.blogPost.create({
            data: {
                title: 'JavaScript Testing Strategies',
                description: 'Comprehensive guide to testing JavaScript applications. Covers unit testing, integration testing, end-to-end testing, and test-driven development (TDD). Learn how to write reliable, maintainable tests for modern web projects.',
                authorId: users[4].id, // James
                tags: { connect: [{ id: tags[3].id }, { id: tags[1].id }] },
                codeTemplates: { connect: [{ id: createdTemplates[1].id }] },
                upvotes: 312,
                downvotes: 23,
                createdAt: new Date('2024-05-10T09:30:00Z')
            }
        }),

        prisma.blogPost.create({
            data: {
                title: 'Understanding React Hooks',
                description: 'A comprehensive guide to using React Hooks for state and lifecycle management in functional components.',
                authorId: users[1].id,  // Sarah
                tags: { connect: [{ id: tags[1].id }, { id: tags[3].id }] }, // basics, functions
                codeTemplates: { connect: [{ id: createdTemplates[4].id }] }, // JavaScript String Utils
                createdAt: getRandomPastDate(),
                upvotes: 50,
                downvotes: 2
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Advanced TypeScript Types',
                description: 'Deep dive into advanced TypeScript types including union, intersection, and mapped types.',
                authorId: users[2].id,  // Mike
                tags: { connect: [{ id: tags[9].id }, { id: tags[1].id }] }, // object-oriented, basics
                codeTemplates: { connect: [{ id: createdTemplates[6].id }] }, // TypeScript User Manager
                createdAt: getRandomPastDate(),
                upvotes: 75,
                downvotes: 5
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Building REST APIs with Node.js',
                description: 'Learn how to build and secure RESTful APIs using Node.js and Express.',
                authorId: users[3].id,  // Emma
                tags: { connect: [{ id: tags[1].id }, { id: tags[3].id }] }, // basics, functions
                codeTemplates: { connect: [{ id: createdTemplates[5].id }] }, // JavaScript Math Helper
                createdAt: getRandomPastDate(),
                upvotes: 60,
                downvotes: 3
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Mastering CSS Grid',
                description: 'A complete guide to CSS Grid layout with practical examples and use cases.',
                authorId: users[4].id,  // James
                tags: { connect: [{ id: tags[1].id }, { id: tags[2].id }] }, // basics, arrays
                codeTemplates: { connect: [{ id: createdTemplates[7].id }] }, // TypeScript Array Utils
                createdAt: getRandomPastDate(),
                upvotes: 80,
                downvotes: 4
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Introduction to Docker',
                description: 'Get started with Docker and learn how to containerize your applications.',
                authorId: users[5].id,  // Lisa
                tags: { connect: [{ id: tags[1].id }, { id: tags[6].id }] }, // basics, data structures
                codeTemplates: { connect: [{ id: createdTemplates[8].id }] }, // Ruby Array Sorting
                createdAt: getRandomPastDate(),
                upvotes: 90,
                downvotes: 6
            }
        }),

        prisma.blogPost.create({
            data: {
                title: 'Introduction to GraphQL',
                description: 'Learn the basics of GraphQL and how to integrate it with your existing applications.',
                authorId: users[1].id,  // Sarah
                tags: { connect: [{ id: tags[1].id }, { id: tags[3].id }] }, // basics, functions
                codeTemplates: { connect: [{ id: createdTemplates[4].id }] }, // JavaScript String Utils
                createdAt: getRandomPastDate(),
                upvotes: 120,
                downvotes: 8
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Building Scalable Microservices',
                description: 'A guide to building scalable microservices architecture using Docker and Kubernetes.',
                authorId: users[2].id,  // Mike
                tags: { connect: [{ id: tags[6].id }, { id: tags[7].id }] }, // data structures, math
                codeTemplates: { connect: [{ id: createdTemplates[6].id }] }, // TypeScript User Manager
                createdAt: getRandomPastDate(),
                upvotes: 95,
                downvotes: 7
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Deep Learning with TensorFlow',
                description: 'An introduction to deep learning concepts and how to implement them using TensorFlow.',
                authorId: users[3].id,  // Emma
                tags: { connect: [{ id: tags[5].id }, { id: tags[7].id }] }, // algorithms, math
                codeTemplates: { connect: [{ id: createdTemplates[5].id }] }, // JavaScript Math Helper
                createdAt: getRandomPastDate(),
                upvotes: 110,
                downvotes: 9
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Mastering Redux for State Management',
                description: 'A comprehensive guide to managing state in React applications using Redux.',
                authorId: users[4].id,  // James
                tags: { connect: [{ id: tags[1].id }, { id: tags[2].id }] }, // basics, arrays
                codeTemplates: { connect: [{ id: createdTemplates[7].id }] }, // TypeScript Array Utils
                createdAt: getRandomPastDate(),
                upvotes: 130,
                downvotes: 10
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Getting Started with Vue.js',
                description: 'Learn how to build dynamic web applications using Vue.js.',
                authorId: users[5].id,  // Lisa
                tags: { connect: [{ id: tags[1].id }, { id: tags[6].id }] }, // basics, data structures
                codeTemplates: { connect: [{ id: createdTemplates[8].id }] }, // Ruby Array Sorting
                createdAt: getRandomPastDate(),
                upvotes: 140,
                downvotes: 11
            }
        }),

        prisma.blogPost.create({
            data: {
                title: 'Introduction to Kubernetes',
                description: 'Learn the basics of Kubernetes and how to orchestrate containerized applications.',
                authorId: users[1].id,  // Sarah
                tags: { connect: [{ id: tags[1].id }, { id: tags[6].id }] }, // basics, data structures
                codeTemplates: { connect: [{ id: createdTemplates[4].id }] }, // JavaScript String Utils
                createdAt: getRandomPastDate(),
                upvotes: 150,
                downvotes: 10
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Advanced Python Decorators',
                description: 'Deep dive into advanced usage of Python decorators for code reuse and readability.',
                authorId: users[2].id,  // Mike
                tags: { connect: [{ id: tags[5].id }, { id: tags[1].id }] }, // algorithms, basics
                codeTemplates: { connect: [{ id: createdTemplates[6].id }] }, // TypeScript User Manager
                createdAt: getRandomPastDate(),
                upvotes: 85,
                downvotes: 6
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Building Real-time Applications with Node.js',
                description: 'Learn how to build real-time applications using Node.js and WebSockets.',
                authorId: users[3].id,  // Emma
                tags: { connect: [{ id: tags[1].id }, { id: tags[3].id }] }, // basics, functions
                codeTemplates: { connect: [{ id: createdTemplates[5].id }] }, // JavaScript Math Helper
                createdAt: getRandomPastDate(),
                upvotes: 70,
                downvotes: 4
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Mastering Flexbox for Responsive Design',
                description: 'A complete guide to using Flexbox for creating responsive web layouts.',
                authorId: users[4].id,  // James
                tags: { connect: [{ id: tags[1].id }, { id: tags[2].id }] }, // basics, arrays
                codeTemplates: { connect: [{ id: createdTemplates[7].id }] }, // TypeScript Array Utils
                createdAt: getRandomPastDate(),
                upvotes: 95,
                downvotes: 5
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Introduction to Machine Learning with Python',
                description: 'Get started with machine learning using Python and popular libraries like scikit-learn.',
                authorId: users[5].id,  // Lisa
                tags: { connect: [{ id: tags[1].id }, { id: tags[6].id }] }, // basics, data structures
                codeTemplates: { connect: [{ id: createdTemplates[8].id }] }, // Ruby Array Sorting
                createdAt: getRandomPastDate(),
                upvotes: 110,
                downvotes: 7
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Building Progressive Web Apps',
                description: 'Learn how to build Progressive Web Apps (PWAs) that work offline and provide a native app-like experience.',
                authorId: users[1].id,  // Sarah
                tags: { connect: [{ id: tags[1].id }, { id: tags[3].id }] }, // basics, functions
                codeTemplates: { connect: [{ id: createdTemplates[4].id }] }, // JavaScript String Utils
                createdAt: getRandomPastDate(),
                upvotes: 130,
                downvotes: 9
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Advanced CSS Animations',
                description: 'Explore advanced techniques for creating smooth and performant CSS animations.',
                authorId: users[2].id,  // Mike
                tags: { connect: [{ id: tags[1].id }, { id: tags[2].id }] }, // basics, arrays
                codeTemplates: { connect: [{ id: createdTemplates[6].id }] }, // TypeScript User Manager
                createdAt: getRandomPastDate(),
                upvotes: 100,
                downvotes: 8
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Building RESTful APIs with Django',
                description: 'Learn how to build and secure RESTful APIs using Django and Django REST framework.',
                authorId: users[3].id,  // Emma
                tags: { connect: [{ id: tags[1].id }, { id: tags[3].id }] }, // basics, functions
                codeTemplates: { connect: [{ id: createdTemplates[5].id }] }, // JavaScript Math Helper
                createdAt: getRandomPastDate(),
                upvotes: 90,
                downvotes: 6
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Mastering JavaScript Promises',
                description: 'A comprehensive guide to understanding and using JavaScript Promises for asynchronous programming.',
                authorId: users[4].id,  // James
                tags: { connect: [{ id: tags[1].id }, { id: tags[2].id }] }, // basics, arrays
                codeTemplates: { connect: [{ id: createdTemplates[7].id }] }, // TypeScript Array Utils
                createdAt: getRandomPastDate(),
                upvotes: 115,
                downvotes: 7
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Introduction to WebAssembly',
                description: 'Learn the basics of WebAssembly and how to run high-performance code in the browser.',
                authorId: users[5].id,  // Lisa
                tags: { connect: [{ id: tags[1].id }, { id: tags[6].id }] }, // basics, data structures
                codeTemplates: { connect: [{ id: createdTemplates[8].id }] }, // Ruby Array Sorting
                createdAt: getRandomPastDate(),
                upvotes: 125,
                downvotes: 8
            }
        })
    ]);

// Create nested comments
    const nestedComments = await Promise.all([
        // Comments for Python ML post
        prisma.comment.create({
            data: {
                content: 'This tutorial really helped me understand the basics of ML!',
                authorId: users[5].id,
                blogPostId: morePosts[0].id,
                upvotes: 45,
                downvotes: 2,
                createdAt: new Date('2024-01-15T10:30:00Z'),
                replies: {
                    create: [
                        {
                            content: 'Agreed! The scikit-learn examples were particularly helpful.',
                            authorId: users[6].id,
                            upvotes: 23,
                            downvotes: 1,
                            createdAt: new Date('2024-01-15T11:45:00Z')
                        },
                        {
                            content: 'Could you explain more about feature scaling?',
                            authorId: users[7].id,
                            upvotes: 15,
                            downvotes: 0,
                            createdAt: new Date('2024-01-15T13:20:00Z'),
                            replies: {
                                create: [
                                    {
                                        content: 'Here\'s a great resource on feature scaling...',
                                        authorId: users[2].id,
                                        upvotes: 12,
                                        downvotes: 0,
                                        createdAt: new Date('2024-01-15T14:30:00Z')
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        }),

        // Comments for Async JS post
        prisma.comment.create({
            data: {
                content: 'Finally understanding Promise chaining thanks to this!',
                authorId: users[8].id,
                blogPostId: morePosts[1].id,
                upvotes: 67,
                downvotes: 3,
                createdAt: new Date('2024-02-01T16:30:00Z'),
                replies: {
                    create: [
                        {
                            content: 'The error handling section was particularly enlightening.',
                            authorId: users[9].id,
                            upvotes: 34,
                            downvotes: 2,
                            createdAt: new Date('2024-02-01T17:15:00Z'),
                            replies: {
                                create: [
                                    {
                                        content: 'Yes, I\'ve been doing it wrong all this time!',
                                        authorId: users[1].id,
                                        upvotes: 28,
                                        downvotes: 1,
                                        createdAt: new Date('2024-02-01T18:00:00Z')
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        }),

        // Additional comments and nested comments for various posts
        prisma.comment.create({
            data: {
                content: 'The explanation of memory management patterns is excellent. Really helped me understand RAII better.',
                authorId: users[2].id, // Mike
                blogPostId: morePosts[6].id,
                upvotes: 45,
                downvotes: 2,
                createdAt: new Date('2024-03-25T17:20:00Z'),
                replies: {
                    create: [
                        {
                            content: 'Agreed! Though I wish there was more about smart pointer implementation details.',
                            authorId: users[3].id, // Emma
                            upvotes: 28,
                            downvotes: 1,
                            createdAt: new Date('2024-03-25T18:15:00Z'),
                            replies: {
                                create: [
                                    {
                                        content: 'Check out the follow-up post on custom deleters and allocators!',
                                        authorId: users[7].id, // Olivia
                                        upvotes: 15,
                                        downvotes: 0,
                                        createdAt: new Date('2024-03-25T19:30:00Z')
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        }),

        prisma.comment.create({
            data: {
                content: 'Your TypeScript generics examples really cleared up my confusion about conditional types.',
                authorId: users[4].id, // James
                blogPostId: morePosts[5].id,
                upvotes: 67,
                downvotes: 3,
                createdAt: new Date('2024-03-20T13:45:00Z'),
                replies: {
                    create: [
                        {
                            content: 'Have you tried applying these patterns to mapped types? They work beautifully together.',
                            authorId: users[5].id, // Lisa
                            upvotes: 34,
                            downvotes: 1,
                            createdAt: new Date('2024-03-20T14:30:00Z')
                        }
                    ]
                }
            }
        }),

        prisma.comment.create({
            data: {
                content: 'The performance comparisons between different data structures are invaluable. Saved this for future reference!',
                authorId: users[6].id, // David
                blogPostId: morePosts[8].id,
                upvotes: 89,
                downvotes: 4,
                createdAt: new Date('2024-04-02T10:15:00Z')
            }
        }),

        prisma.comment.create({
            data: {
                content: 'These React patterns have become our teams standard practices. Great work!',
                authorId: users[8].id, // Daniel
                blogPostId: morePosts[10].id,
                upvotes: 112,
                downvotes: 5,
                createdAt: new Date('2024-04-05T15:30:00Z'),
                replies: {
                    create: [
                        {
                            content: 'How do you handle state management in larger applications?',
                            authorId: users[9].id, // Sophia
                            upvotes: 56,
                            downvotes: 2,
                            createdAt: new Date('2024-04-05T16:45:00Z'),
                            replies: {
                                create: [
                                    {
                                        content: 'We use a combination of Context API and local state. Works great for most cases.',
                                        authorId: users[8].id, // Daniel
                                        upvotes: 78,
                                        downvotes: 3,
                                        createdAt: new Date('2024-04-05T17:20:00Z')
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        }),

        prisma.comment.create({
            data: {
                content: 'The section on concurrent data structures in Go was particularly enlightening.',
                authorId: users[1].id, // Sarah
                blogPostId: morePosts[12].id,
                upvotes: 94,
                downvotes: 4,
                createdAt: new Date('2024-04-08T09:30:00Z'),
                replies: {
                    create: [
                        {
                            content: 'Could you elaborate on channel patterns for worker pools?',
                            authorId: users[3].id, // Emma
                            upvotes: 45,
                            downvotes: 2,
                            createdAt: new Date('2024-04-08T10:15:00Z')
                        }
                    ]
                }
            }
        }),

        prisma.comment.create({
            data: {
                content: 'Finally, a clear explanation of Pythons asyncio! The diagrams really help.',
        authorId: users[5].id, // Lisa
        blogPostId: morePosts[14].id,
        upvotes: 156,
        downvotes: 7,
        createdAt: new Date('2024-04-12T14:20:00Z')
}
}),

    prisma.comment.create({
        data: {
            content: 'Your explanation of compiler optimizations changed how I write performance-critical code.',
            authorId: users[7].id, // Olivia
            blogPostId: morePosts[16].id,
            upvotes: 134,
            downvotes: 6,
            createdAt: new Date('2024-04-15T11:45:00Z'),
            replies: {
                create: [
                    {
                        content: 'The section about loop unrolling was particularly eye-opening.',
                        authorId: users[2].id, // Mike
                        upvotes: 67,
                        downvotes: 3,
                        createdAt: new Date('2024-04-15T12:30:00Z'),
                        replies: {
                            create: [
                                {
                                    content: 'Have you benchmarked the difference? Its quite significant in numeric computations.',
                                    authorId: users[4].id, // James
                                    upvotes: 45,
                                    downvotes: 2,
                                    createdAt: new Date('2024-04-15T13:15:00Z')
                                }
                            ]
                        }
                    }
                ]
            }
        }
    }),

        prisma.comment.create({
            data: {
                content: 'This Ruby metaprogramming guide is now my go-to reference. Incredibly well-written!',
                authorId: users[9].id, // Sophia
                blogPostId: morePosts[18].id,
                upvotes: 178,
                downvotes: 8,
                createdAt: new Date('2024-04-18T16:30:00Z')
            }
        }),

        prisma.comment.create({
            data: {
                content: 'The database optimization techniques you shared improved our query performance by 40%!',
                authorId: users[3].id, // Emma
                blogPostId: morePosts[20].id,
                upvotes: 223,
                downvotes: 9,
                createdAt: new Date('2024-04-22T10:45:00Z'),
                replies: {
                    create: [
                        {
                            content: 'Which indexing strategy worked best for your use case?',
                            authorId: users[6].id, // David
                            upvotes: 89,
                            downvotes: 4,
                            createdAt: new Date('2024-04-22T11:30:00Z'),
                            replies: {
                                create: [
                                    {
                                        content: 'Composite indexes on our most frequent query patterns made the biggest difference.',
                                        authorId: users[3].id, // Emma
                                        upvotes: 67,
                                        downvotes: 3,
                                        createdAt: new Date('2024-04-22T12:15:00Z')
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        }),

        prisma.comment.create({
            data: {
                content: 'Great walkthrough of microservices security best practices. Implementation details were spot on.',
                authorId: users[1].id, // Sarah
                blogPostId: morePosts[22].id,
                upvotes: 145,
                downvotes: 6,
                createdAt: new Date('2024-04-25T13:20:00Z'),
                replies: {
                    create: [
                        {
                            content: 'The JWT handling patterns are particularly robust. Weve adopted them in our system.',
                            authorId: users[8].id, // Daniel
                            upvotes: 78,
                            downvotes: 3,
                            createdAt: new Date('2024-04-25T14:45:00Z')
                        }
                    ]
                }
            }
        }),

        prisma.comment.create({
            data: {
                content: 'Using these WebAssembly optimization techniques cut our processing time in half!',
                authorId: users[4].id, // James
                blogPostId: morePosts[24].id,
                upvotes: 167,
                downvotes: 7,
                createdAt: new Date('2024-04-28T15:30:00Z'),
                replies: {
                    create: [
                        {
                            content: 'Did you encounter any memory management challenges during implementation?',
                            authorId: users[5].id, // Lisa
                            upvotes: 56,
                            downvotes: 2,
                            createdAt: new Date('2024-04-28T16:15:00Z'),
                            replies: {
                                create: [
                                    {
                                        content: 'Yes, we had to carefully manage the memory sharing between JS and Wasm.',
                                        authorId: users[4].id, // James
                                        upvotes: 34,
                                        downvotes: 1,
                                        createdAt: new Date('2024-04-28T17:00:00Z')
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        }),

        prisma.comment.create({
            data: {
                content: 'Your debugging techniques for race conditions saved our production system!',
                authorId: users[2].id, // Mike
                blogPostId: morePosts[26].id,
                upvotes: 189,
                downvotes: 8,
                createdAt: new Date('2024-05-01T09:45:00Z')
            }
        }),

        prisma.comment.create({
            data: {
                content: 'The machine learning model optimization tips are gold. Reduced our training time significantly.',
                authorId: users[6].id, // David
                blogPostId: morePosts[28].id,
                upvotes: 234,
                downvotes: 10,
                createdAt: new Date('2024-05-04T14:15:00Z'),
                replies: {
                    create: [
                        {
                            content: 'Which batch size ended up working best for your dataset?',
                            authorId: users[7].id, // Olivia
                            upvotes: 89,
                            downvotes: 4,
                            createdAt: new Date('2024-05-04T15:00:00Z'),
                            replies: {
                                create: [
                                    {
                                        content: 'We found 256 to be the sweet spot for our GPU memory and convergence rate.',
                                        authorId: users[6].id, // David
                                        upvotes: 67,
                                        downvotes: 3,
                                        createdAt: new Date('2024-05-04T15:45:00Z')
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        }),

        prisma.comment.create({
            data: {
                content: 'These React performance optimization patterns really improved our apps responsiveness.',
                authorId: users[8].id, // Daniel
                blogPostId: morePosts[30].id,
                upvotes: 156,
                downvotes: 7,
                createdAt: new Date('2024-05-07T10:30:00Z'),
                replies: {
                    create: [
                        {
                            content: 'The useMemo usage guidelines were particularly helpful.',
                            authorId: users[9].id, // Sophia
                            upvotes: 78,
                            downvotes: 3,
                            createdAt: new Date('2024-05-07T11:15:00Z')
                        }
                    ]
                }
            }
        }),


    ]);

// Create additional top-level comments with nested replies
    const moreComments = await Promise.all([
        prisma.comment.create({
            data: {
                content: 'The examples could be more advanced',
                authorId: users[3].id,
                blogPostId: morePosts[0].id,
                upvotes: 12,
                downvotes: 8,
                createdAt: new Date('2024-01-16T09:30:00Z'),
                replies: {
                    create: [
                        {
                            content: 'This is meant to be an intro tutorial though',
                            authorId: users[4].id,
                            upvotes: 45,
                            downvotes: 2,
                            createdAt: new Date('2024-01-16T10:15:00Z')
                        }
                    ]
                }
            }
        }),

        prisma.comment.create({
            data: {
                content: 'Will there be a follow-up advanced post?',
                authorId: users[5].id,
                blogPostId: morePosts[1].id,
                upvotes: 34,
                downvotes: 1,
                createdAt: new Date('2024-02-02T11:45:00Z'),
                replies: {
                    create: [
                        {
                            content: 'Working on it! Should be ready next week.',
                            authorId: users[4].id,
                            upvotes: 56,
                            downvotes: 3,
                            createdAt: new Date('2024-02-02T12:30:00Z'),
                            replies: {
                                create: [
                                    {
                                        content: 'Looking forward to it!',
                                        authorId: users[6].id,
                                        upvotes: 23,
                                        downvotes: 1,
                                        createdAt: new Date('2024-02-02T13:15:00Z')
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        }),

        // Comments for previously uncommented blog posts
        prisma.comment.create({
            data: {
                content: 'The section on Redux middleware architecture has transformed how I structure my applications.',
                authorId: users[3].id, // Emma
                blogPostId: morePosts[14].id, // Using valid index
                upvotes: 89,
                downvotes: 4,
                createdAt: new Date('2024-05-08T09:15:00Z'),
                replies: {
                    create: [
                        {
                            content: 'What are your thoughts on Redux Toolkit versus traditional Redux?',
                            authorId: users[4].id, // James
                            upvotes: 45,
                            downvotes: 2,
                            createdAt: new Date('2024-05-08T10:30:00Z'),
                            replies: {
                                create: [
                                    {
                                        content: 'Redux Toolkit has simplified our state management considerably. The built-in immutability is invaluable.',
                                        authorId: users[3].id,
                                        upvotes: 34,
                                        downvotes: 1,
                                        createdAt: new Date('2024-05-08T11:45:00Z')
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        }),

        prisma.comment.create({
            data: {
                content: 'The Kubernetes networking explanations are extremely thorough. This resolved many scaling issues.',
                authorId: users[5].id, // Lisa
                blogPostId: morePosts[13].id, // Using valid index
                upvotes: 112,
                downvotes: 5,
                createdAt: new Date('2024-05-09T13:20:00Z'),
                replies: {
                    create: [
                        {
                            content: 'The service mesh implementation guide was particularly useful for our microservices.',
                            authorId: users[6].id, // David
                            upvotes: 67,
                            downvotes: 3,
                            createdAt: new Date('2024-05-09T14:45:00Z')
                        }
                    ]
                }
            }
        }),

        prisma.comment.create({
            data: {
                content: 'The comparison of Vue.js lifecycle hooks with React helped me understand component architecture better.',
                authorId: users[7].id, // Olivia
                blogPostId: morePosts[12].id, // Using valid index
                upvotes: 78,
                downvotes: 3,
                createdAt: new Date('2024-05-10T11:30:00Z')
            }
        }),

        prisma.comment.create({
            data: {
                content: 'The Python decorator patterns are excellent. I have implemented the caching example in production.',
                authorId: users[8].id, // Daniel
                blogPostId: morePosts[11].id, // Using valid index
                upvotes: 145,
                downvotes: 6,
                createdAt: new Date('2024-05-11T15:45:00Z'),
                replies: {
                    create: [
                        {
                            content: 'Have you encountered any memory issues with the memoization pattern?',
                            authorId: users[9].id, // Sophia
                            upvotes: 56,
                            downvotes: 2,
                            createdAt: new Date('2024-05-11T16:30:00Z')
                        }
                    ]
                }
            }
        }),

        prisma.comment.create({
            data: {
                content: 'The WebSocket implementation guide has improved our real time communication significantly.',
                authorId: users[1].id, // Sarah
                blogPostId: morePosts[10].id, // Using valid index
                upvotes: 167,
                downvotes: 7,
                createdAt: new Date('2024-05-12T10:15:00Z')
            }
        }),

        prisma.comment.create({
            data: {
                content: 'The Flexbox grid system examples are comprehensive. Perfect for responsive layouts.',
                authorId: users[2].id, // Mike
                blogPostId: morePosts[9].id, // Using valid index
                upvotes: 134,
                downvotes: 5,
                createdAt: new Date('2024-05-13T14:20:00Z'),
                replies: {
                    create: [
                        {
                            content: 'The fallback solutions for older browsers are particularly well thought out.',
                            authorId: users[3].id, // Emma
                            upvotes: 89,
                            downvotes: 4,
                            createdAt: new Date('2024-05-13T15:45:00Z')
                        }
                    ]
                }
            }
        }),

        prisma.comment.create({
            data: {
                content: 'The TensorFlow optimization techniques reduced our model training time by 40 percent.',
                authorId: users[4].id, // James
                blogPostId: morePosts[8].id, // Using valid index
                upvotes: 223,
                downvotes: 9,
                createdAt: new Date('2024-05-14T09:30:00Z'),
                replies: {
                    create: [
                        {
                            content: 'What batch size configuration worked best for your use case?',
                            authorId: users[5].id, // Lisa
                            upvotes: 78,
                            downvotes: 3,
                            createdAt: new Date('2024-05-14T10:45:00Z'),
                            replies: {
                                create: [
                                    {
                                        content: 'We found 512 to be optimal for our GPU configuration and dataset size.',
                                        authorId: users[4].id,
                                        upvotes: 56,
                                        downvotes: 2,
                                        createdAt: new Date('2024-05-14T11:30:00Z')
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        }),

        prisma.comment.create({
            data: {
                content: 'The CSS animation performance tips have made our transitions much smoother.',
                authorId: users[6].id, // David
                blogPostId: morePosts[7].id, // Using valid index
                upvotes: 156,
                downvotes: 6,
                createdAt: new Date('2024-05-15T13:15:00Z')
            }
        }),

        prisma.comment.create({
            data: {
                content: 'The Django authentication system customization guide is incredibly detailed and secure.',
                authorId: users[7].id, // Olivia
                blogPostId: morePosts[6].id, // Using valid index
                upvotes: 189,
                downvotes: 8,
                createdAt: new Date('2024-05-16T11:45:00Z'),
                replies: {
                    create: [
                        {
                            content: 'The JWT implementation example is particularly robust.',
                            authorId: users[8].id, // Daniel
                            upvotes: 67,
                            downvotes: 3,
                            createdAt: new Date('2024-05-16T12:30:00Z')
                        }
                    ]
                }
            }
        }),

        prisma.comment.create({
            data: {
                content: 'This helped me understand WebAssembly integration with JavaScript much better.',
                authorId: users[9].id, // Sophia
                blogPostId: morePosts[5].id, // Using valid index
                upvotes: 145,
                downvotes: 5,
                createdAt: new Date('2024-05-17T15:20:00Z'),
                replies: {
                    create: [
                        {
                            content: 'The memory management explanation between JS and WASM is excellent.',
                            authorId: users[1].id, // Sarah
                            upvotes: 78,
                            downvotes: 3,
                            createdAt: new Date('2024-05-17T16:45:00Z')
                        }
                    ]
                }
            }
        })
    ]);

// Create regular comments for remaining posts
    const regularComments = await Promise.all([
        prisma.comment.create({
            data: {
                content: 'Great explanation of metaprogramming concepts!',
                authorId: users[7].id,
                blogPostId: morePosts[2].id,
                upvotes: 89,
                downvotes: 4,
                createdAt: new Date('2024-02-15T14:30:00Z')
            }
        }),

        prisma.comment.create({
            data: {
                content: 'The concurrency patterns are very practical',
                authorId: users[8].id,
                blogPostId: morePosts[3].id,
                upvotes: 67,
                downvotes: 3,
                createdAt: new Date('2024-03-01T11:20:00Z'),
                replies: {
                    create: [
                        {
                            content: 'Especially the worker pool pattern!',
                            authorId: users[9].id,
                            upvotes: 45,
                            downvotes: 2,
                            createdAt: new Date('2024-03-01T12:45:00Z')
                        }
                    ]
                }
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

    // Additional comments for each blog post
    const additionalComments = await Promise.all([
        // Comments for TypeScript Generics post
        prisma.comment.create({
            data: {
                content: 'This explanation of generics finally made it click for me. The examples are incredibly practical!',
                authorId: users[2].id, // Mike
                blogPostId: additionalPosts[0].id,
                upvotes: 23,
                downvotes: 1
            }
        }),
        prisma.comment.create({
            data: {
                content: 'Would love to see a follow-up post about advanced generic constraints and mapped types.',
                authorId: users[4].id, // James
                blogPostId: additionalPosts[0].id,
                upvotes: 15,
                downvotes: 0
            }
        }),

        // Comments for Ruby Arrays post
        prisma.comment.create({
            data: {
                content: 'The performance comparison between different sorting methods was eye-opening!',
                authorId: users[3].id, // Emma
                blogPostId: additionalPosts[1].id,
                upvotes: 34,
                downvotes: 2
            }
        }),
        prisma.comment.create({
            data: {
                content: 'Used these techniques in my project and saw a significant performance improvement.',
                authorId: users[8].id, // Daniel
                blogPostId: additionalPosts[1].id,
                upvotes: 28,
                downvotes: 1
            }
        }),

        // Comments for Go Data Structures post
        prisma.comment.create({
            data: {
                content: 'The comparison between built-in maps and custom implementations was very helpful.',
                authorId: users[5].id, // Lisa
                blogPostId: additionalPosts[2].id,
                upvotes: 45,
                downvotes: 3
            }
        }),
        prisma.comment.create({
            data: {
                content: 'Could you elaborate on concurrent access patterns for these data structures?',
                authorId: users[9].id, // Sophia
                blogPostId: additionalPosts[2].id,
                upvotes: 31,
                downvotes: 2
            }
        }),

        // Comments for PHP String Processing post
        prisma.comment.create({
            data: {
                content: 'The Unicode handling section saved me hours of debugging. Thank you!',
                authorId: users[6].id, // David
                blogPostId: additionalPosts[3].id,
                upvotes: 19,
                downvotes: 1
            }
        }),
        prisma.comment.create({
            data: {
                content: 'Great article! Maybe add a section about mbstring functions?',
                authorId: users[1].id, // Sarah
                blogPostId: additionalPosts[3].id,
                upvotes: 12,
                downvotes: 0
            }
        }),

        // Comments for Java Recursion post
        prisma.comment.create({
            data: {
                content: 'The tail recursion optimization examples were particularly enlightening.',
                authorId: users[7].id, // Olivia
                blogPostId: additionalPosts[4].id,
                upvotes: 56,
                downvotes: 4
            }
        }),
        prisma.comment.create({
            data: {
                content: 'Excellent explanation of the trade-offs between recursive and iterative approaches.',
                authorId: users[0].id, // Admin
                blogPostId: additionalPosts[4].id,
                upvotes: 41,
                downvotes: 2
            }
        }),

        // Comments for C++ Memory Management post
        prisma.comment.create({
            data: {
                content: 'The RAII examples really helped me understand modern C++ memory management.',
                authorId: users[8].id, // Daniel
                blogPostId: additionalPosts[5].id,
                upvotes: 37,
                downvotes: 2
            }
        }),
        prisma.comment.create({
            data: {
                content: 'Would love to see more examples of custom deleters with smart pointers.',
                authorId: users[4].id, // James
                blogPostId: additionalPosts[5].id,
                upvotes: 29,
                downvotes: 1
            }
        })
    ]);

    // Add some reports


    // Create various reports for comments and blog posts
    const reports = await Promise.all([
        // Reports for the first set of comments (from additionalComments)
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Spam',
                explanation: 'Contains promotional links and unrelated content.',
                reporterId: users[2].id, // Mike
                commentId: additionalComments[0].id,
                createdAt: new Date('2024-03-01T08:30:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Hate speech',
                explanation: 'Comment contains offensive language targeting specific groups.',
                reporterId: users[3].id, // Emma
                commentId: nestedComments[0].id,
                createdAt: new Date('2024-03-15T09:30:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Hate speech',
                explanation: 'Contains discriminatory remarks that violate community guidelines.',
                reporterId: users[5].id, // Lisa
                commentId: nestedComments[0].id,
                createdAt: new Date('2024-03-15T10:45:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Harassment',
                explanation: 'Personal attacks against the author.',
                reporterId: users[7].id, // Olivia
                commentId: nestedComments[0].id,
                createdAt: new Date('2024-03-15T11:20:00Z')
            }
        }),

        // Multiple reports for a blog post
        prisma.report.create({
            data: {
                type: 'BLOGPOST',
                reason: 'Plagiarism',
                explanation: 'Content appears to be copied from another website without attribution.',
                reporterId: users[2].id, // Mike
                blogPostId: morePosts[0].id,
                createdAt: new Date('2024-03-20T14:15:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'BLOGPOST',
                reason: 'Plagiarism',
                explanation: 'This content is copied from a published book without proper citation.',
                reporterId: users[4].id, // James
                blogPostId: morePosts[0].id,
                createdAt: new Date('2024-03-20T16:30:00Z')
            }
        }),

        // Reports for nested comments
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Spam',
                explanation: 'Comment contains promotional links and spam content.',
                reporterId: users[1].id, // Sarah
                commentId: nestedComments[1].id,
                createdAt: new Date('2024-03-25T08:45:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Misinformation',
                explanation: 'Comment contains factually incorrect information about programming concepts.',
                reporterId: users[6].id, // David
                commentId: nestedComments[1].id,
                createdAt: new Date('2024-03-28T11:30:00Z')
            }
        }),

        // Reports for regular comments
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Inappropriate content',
                explanation: 'Comment contains explicit content inappropriate for learning platform.',
                reporterId: users[8].id, // Daniel
                commentId: regularComments[0].id,
                createdAt: new Date('2024-04-01T09:15:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Inappropriate content',
                explanation: 'Inappropriate language and content not suitable for professional discussion.',
                reporterId: users[9].id, // Sophia
                commentId: regularComments[0].id,
                createdAt: new Date('2024-04-01T10:20:00Z')
            }
        }),

        // More blog post reports
        prisma.report.create({
            data: {
                type: 'BLOGPOST',
                reason: 'Inaccurate content',
                explanation: 'Post contains outdated information that could mislead readers.',
                reporterId: users[2].id, // Mike
                blogPostId: morePosts[3].id,
                createdAt: new Date('2024-04-05T13:45:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'BLOGPOST',
                reason: 'Copyright violation',
                explanation: 'Post contains copyrighted code examples without permission.',
                reporterId: users[4].id, // James
                blogPostId: morePosts[5].id,
                createdAt: new Date('2024-04-10T15:30:00Z')
            }
        }),

        // Reports for more recent comments
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Trolling',
                explanation: 'User is deliberately provocative and not contributing to discussion.',
                reporterId: users[5].id, // Lisa
                commentId: regularComments[1].id,
                createdAt: new Date('2024-04-15T16:20:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Off-topic',
                explanation: 'Comment is completely unrelated to the post topic.',
                reporterId: users[7].id, // Olivia
                commentId: moreComments[0].id,
                createdAt: new Date('2024-04-20T10:45:00Z')
            }
        }),

        // Final batch
        prisma.report.create({
            data: {
                type: 'BLOGPOST',
                reason: 'Misleading title',
                explanation: 'Post content does not match what was promised in the title.',
                reporterId: users[3].id, // Emma
                blogPostId: morePosts[8].id,
                createdAt: new Date('2024-04-25T14:15:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Personal information',
                explanation: 'Comment contains personal contact information.',
                reporterId: users[6].id, // David
                commentId: moreComments[1].id,
                createdAt: new Date('2024-04-30T11:30:00Z')
            }
        }),
        // 10 more reports with varied types and reasons
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Copyright infringement',
                explanation: 'Comment includes copyrighted code snippets without attribution or permission.',
                reporterId: users[1].id, // Sarah
                commentId: moreComments[0].id,
                createdAt: new Date('2024-05-01T09:15:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'BLOGPOST',
                reason: 'Security vulnerability',
                explanation: 'Post contains code examples with serious security vulnerabilities without proper warnings.',
                reporterId: users[3].id, // Emma
                blogPostId: morePosts[10].id,
                createdAt: new Date('2024-05-02T14:30:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Harassment',
                explanation: 'User is repeatedly targeting and criticizing the author personally rather than discussing the content.',
                reporterId: users[5].id, // Lisa
                commentId: nestedComments[1].id,
                createdAt: new Date('2024-05-03T11:45:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'BLOGPOST',
                reason: 'Spam',
                explanation: 'Post is filled with promotional links and irrelevant advertising content.',
                reporterId: users[7].id, // Olivia
                blogPostId: morePosts[12].id,
                createdAt: new Date('2024-05-04T16:20:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Misinformation',
                explanation: 'Comment provides dangerously incorrect information about system security practices.',
                reporterId: users[2].id, // Mike
                commentId: regularComments[0].id,
                createdAt: new Date('2024-05-05T10:30:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Inappropriate content',
                explanation: 'Comment contains explicit language and inappropriate jokes.',
                reporterId: users[4].id, // James
                commentId: moreComments[1].id,
                createdAt: new Date('2024-05-06T13:45:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'BLOGPOST',
                reason: 'Duplicate content',
                explanation: 'This post is an exact duplicate of an existing article on the platform.',
                reporterId: users[6].id, // David
                blogPostId: morePosts[15].id,
                createdAt: new Date('2024-05-07T15:15:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Off-topic',
                explanation: 'Comment thread has devolved into political discussion unrelated to programming.',
                reporterId: users[8].id, // Daniel
                commentId: nestedComments[0].id,
                createdAt: new Date('2024-05-08T09:00:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'BLOGPOST',
                reason: 'Outdated content',
                explanation: 'Post contains deprecated methods and outdated security practices that could be harmful if followed.',
                reporterId: users[9].id, // Sophia
                blogPostId: morePosts[18].id,
                createdAt: new Date('2024-05-09T12:30:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Personal information',
                explanation: 'Comment reveals private contact information and personal details without consent.',
                reporterId: users[0].id, // Admin
                commentId: regularComments[1].id,
                createdAt: new Date('2024-05-10T14:45:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'BLOGPOST',
                reason: 'Misleading content',
                explanation: 'The advanced tutorial contains basic concepts marketed as advanced techniques.',
                reporterId: users[3].id, // Emma
                blogPostId: morePosts[20].id, // Different post
                createdAt: new Date('2024-05-11T09:15:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Self-promotion',
                explanation: 'Comment is solely promoting their own competing tutorial website.',
                reporterId: users[5].id, // Lisa
                commentId: additionalComments[2].id, // Different comment
                createdAt: new Date('2024-05-12T14:30:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'BLOGPOST',
                reason: 'Code quality',
                explanation: 'The code examples demonstrate extremely poor practices and could be harmful for beginners.',
                reporterId: users[7].id, // Olivia
                blogPostId: morePosts[22].id, // Different post
                createdAt: new Date('2024-05-13T11:45:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Misinformation',
                explanation: 'The performance claims in this comment are incorrect and misleading.',
                reporterId: users[2].id, // Mike
                commentId: additionalComments[4].id, // Different comment
                createdAt: new Date('2024-05-14T16:20:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'BLOGPOST',
                reason: 'Copyright violation',
                explanation: 'Several diagrams and explanations appear to be copied from a published textbook.',
                reporterId: users[4].id, // James
                blogPostId: morePosts[24].id, // Different post
                createdAt: new Date('2024-05-15T10:30:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Harmful advice',
                explanation: 'The suggested security implementation contains critical vulnerabilities.',
                reporterId: users[6].id, // David
                commentId: additionalComments[6].id, // Different comment
                createdAt: new Date('2024-05-16T13:45:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'BLOGPOST',
                reason: 'Factual errors',
                explanation: 'Multiple technical inaccuracies in the explanation of concurrent programming concepts.',
                reporterId: users[8].id, // Daniel
                blogPostId: morePosts[26].id, // Different post
                createdAt: new Date('2024-05-17T15:15:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Inappropriate tone',
                explanation: 'Condescending and hostile response to a beginner\'s question.',
                reporterId: users[9].id, // Sophia
                commentId: additionalComments[8].id, // Different comment
                createdAt: new Date('2024-05-18T09:00:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'BLOGPOST',
                reason: 'Broken examples',
                explanation: 'None of the code examples in the tutorial actually compile or run.',
                reporterId: users[1].id, // Sarah
                blogPostId: morePosts[28].id, // Different post
                createdAt: new Date('2024-05-19T12:30:00Z')
            }
        }),
        prisma.report.create({
            data: {
                type: 'COMMENT',
                reason: 'Spam',
                explanation: 'Comment is an advertisement for a cryptocurrency scam disguised as a programming tool.',
                reporterId: users[0].id, // Admin
                commentId: additionalComments[10].id, // Different comment
                createdAt: new Date('2024-05-20T14:45:00Z')
            }
        })
    ]);

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