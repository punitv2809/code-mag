import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
const markdown = `
# PHP Generators

Generators in PHP provide an easy way to iterate through large data sets **without the overhead of creating an array in memory**. Instead of returning all the data at once, they yield one value at a time.

---

## 📌 Why Use Generators?

- Memory efficient
- Cleaner syntax for iterators
- Lazy evaluation of values

---

## 🛠️ Basic Example

\`\`\`php
function countToTen() {
    for (\$i = 1; \$i <= 10; \$i++) {
        yield \$i;
    }
}

foreach (countToTen() as \$number) {
    echo \$number . PHP_EOL;
}
\`\`\`

✅ Output:
\`\`\`
1
2
3
...
10
\`\`\`

---

## ⚙️ Understanding \`yield\`

- \`yield\` pauses the function execution
- State is preserved between calls
- Next iteration resumes from the last \`yield\`

---

## 🧠 Generator with Key => Value

\`\`\`php
function getUserRoles() {
    yield 'admin' => 'Can manage everything';
    yield 'editor' => 'Can edit content';
    yield 'viewer' => 'Can only view';
}

foreach (getUserRoles() as \$role => \$desc) {
    echo "\$role: \$desc" . PHP_EOL;
}
\`\`\`

---

## 🚨 Notes

- Generators implement the \`Iterator\` interface
- You can't rewind a generator unless it's explicitly coded to do so

---

## 📚 References

- [PHP Manual – Generators](https://www.php.net/manual/en/language.generators.overview.php)
`

const Blog = () => {
    const [open, setOpen] = useState(false);
    return (
        <div className="h-full w-full flex items-center justify-center flex-row overflow-y-auto px-6 py-4 pt-22">
            <div className="w-full h-full md:w-full lg:w-7/12">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                        h1: ({ node, ...props }) => (
                            <h1 className="text-3xl font-normal mb-3 text-primary tracking-tight" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                            <h2
                                className="text-2xl font-normal mb-3 py-2"
                                {...props}
                            />
                        ),
                        h3: ({ node, ...props }) => (
                            <h3 className="text-xl font-medium mb-3" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                            <p className="text-base leading-7 mb-4" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                            <ul className="list-disc pl-6 space-y-2" {...props} />
                        ),
                        code: ({ node, inline, className, children, ...props }) => {
                            return !inline ? (
                                <div className="bg-background border my-2 rounded-md">
                                    <div className="border-b p-2 flex items-center justify-end">
                                        <Button size={'sm'} className='text-xs' variant={'outline'}>Copy</Button>
                                    </div>
                                    <pre className="overflow-x-auto p-2">
                                        <code className={`${className} text-sm bg-transparent!`} {...props}>
                                            {children}
                                        </code>
                                    </pre>
                                </div>
                            ) : (
                                <code className="px-1 py-0.5 rounded bg-muted text-sm font-mono" {...props}>
                                    {children}
                                </code>
                            )
                        },
                        hr: () => <Separator className="my-8" />,
                        a: ({ node, ...props }) => (
                            <a className="text-primary underline hover:text-primary/80" {...props} />
                        ),
                    }}
                >
                    {markdown}
                </ReactMarkdown>
            </div>
            {/* Animate button */}
            <AnimatePresence>
                {!open && (
                    <motion.div
                        className="absolute bottom-4 right-4 z-10"
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Button onClick={() => setOpen(true)}>Ask AI</Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Animate drawer */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="absolute right-0 top-0 h-full w-full lg:w-5/12 bg-background border-l z-20 flex flex-col"
                    >
                        <div className="h-16 px-4 border-b flex justify-between items-center glass">
                            <h2 className="text-lg font-semibold">Ask AI</h2>
                            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-auto p-0">
                            <Textarea
                                className="h-full resize-none rounded-none border-0"
                                placeholder="Type your question here..."
                                rows={5}
                            />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            transition={{ duration: 0.25, delay: 0.1 }}
                            className="absolute bottom-0 right-0 m-6 justify-end"
                        >
                            <Button type="submit">
                                <ChevronRight />
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}

export default Blog
