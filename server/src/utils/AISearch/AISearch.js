const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const modelPost = require('../../models/post.model');

async function AiSearchKeyword(question) {
    try {
        const prompt = `
        Bạn là một trợ lý thông minh chuyên hỗ trợ tìm kiếm phòng trọ tại Việt Nam.

        Người dùng nhập: "${question}"

        Hãy phân tích và trả về **10 gợi ý tìm kiếm phù hợp nhất** dưới dạng mảng JSON, mỗi phần tử là một object có dạng:
        [
        { "title": "..." },
        { "title": "..." },
        ...
        ]

        Chỉ trả về đúng mảng JSON như trên, không thêm giải thích hay định dạng markdown nào.
        `;

        const result = await model.generateContent(prompt);
        let text = result.response.text();

        // Dọn markdown nếu có
        text = text.replace(/```json|```/g, '').trim();

        const suggestions = JSON.parse(text);
        return suggestions;
    } catch (error) {
        console.log('Lỗi khi gọi Gemini hoặc parse JSON:', error);
        return [];
    }
}

async function AiSearch(question) {
    console.log('question', question);
    try {
        const posts = await modelPost.find({}).limit(20); // Hoặc query trước nếu có AI location
        const postData = posts.map((post) => JSON.stringify(post)).join(',\n');

        const prompt = `
        Dưới đây là danh sách các bài đăng phòng trọ (mỗi bài là 1 JSON object):
        [
        ${postData}
        ]

        Câu hỏi người dùng: "${question}"

        Dựa trên thông tin người dùng đưa ra, hãy chọn các bài đăng phù hợp nhất và trả về mảng JSON gồm toàn bộ object gốc của từng bài đăng.

        Chỉ trả về mảng JSON, không thêm bất kỳ chú thích nào.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response
            .text()
            .replace(/```json|```/g, '')
            .trim();
        const parsed = JSON.parse(text);
        return parsed;
    } catch (err) {
        console.error('Lỗi AI search:', err);
        return [];
    }
}

async function AiGenerateTagsAndSummary({ title, description, category, location, options }) {
    try {
        const prompt = `
        Bạn là trợ lý gợi ý nội dung cho bài đăng phòng trọ tại Việt Nam.
        Dưới đây là các thông tin về bài đăng:
        - Tiêu đề: "${title}"
        - Mô tả: "${description}"
        - Loại: "${category}"
        - Vị trí: "${location}"
        - Tiện ích: "${Array.isArray(options) ? options.join(', ') : options || ''}"

        Hãy tạo:
        1. Một đoạn tóm tắt ngắn gọn (summary) không quá 120 ký tự.
        2. Một danh sách tags/label ngắn gọn, khoảng 5-8 tags, phù hợp với nội dung bài đăng.

        Trả về đúng định dạng JSON duy nhất như sau:
        {
          "summary": "...",
          "tags": ["...", "...", ...]
        }
        `;

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        text = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(text);

        if (!parsed.summary || !Array.isArray(parsed.tags)) {
            throw new Error('AI không trả về định dạng mong muốn');
        }

        return {
            summary: parsed.summary,
            tags: parsed.tags.map((tag) => tag.toString().trim()),
        };
    } catch (err) {
        console.error('Lỗi AI generate tags/summary:', err);
        const fallbackTags = [category, location, ...((Array.isArray(options) ? options : []).slice(0, 5))]
            .filter(Boolean)
            .map((item) => item.toString().toLowerCase());
        return {
            summary: description?.slice(0, 120) || title || '',
            tags: Array.from(new Set(fallbackTags)).slice(0, 8),
        };
    }
}

module.exports = { AiSearchKeyword, AiSearch, AiGenerateTagsAndSummary };
