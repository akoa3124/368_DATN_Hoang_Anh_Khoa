const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const modelPost = require('../../models/post.model');

const stopwords = new Set([
    'có', 'không', 'xem', 'ảnh', 'hình', 'phòng', 'trọ', 'cho', 'của', 'tại', 'ở', 'và', 'là', 'đó', 'này', 'ấy', 'thì', 'một', 'cái', 'anh', 'chị', 'em', 'tôi', 'bạn', 'ở', 'đang', 'được', 'cũng', 'ok', 'nha', 'nhé', 'nhưng', 'nên', 'mua', 'bán', 'giá', 'vip', 'bình', 'thường', 'xinh', 'đẹp'
]);

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isImageRequest(question) {
    if (!question) return false;
    const normalized = question.toLowerCase();
    return /có hình|có ảnh|xem hình|xem ảnh|show image|show photo|hình không|ảnh không/.test(normalized);
}

async function getImageResponse(question) {
    const normalized = question.toLowerCase();
    const idMatch = normalized.match(/([0-9a-fA-F]{24})/);

    if (idMatch) {
        const post = await modelPost.findById(idMatch[1]);
        if (post) {
            return {
                images: Array.isArray(post.images) ? post.images : [],
                postId: post._id.toString(),
                title: post.title,
            };
        }
    }

    const queryTerms = normalized
        .replace(/[^a-z0-9àáâãéèêíìóôõúùưăđạảấầẩẫậắằẳẵặếềểễệỉĩịọỏốồổỗộớờởỡợụủứừửữựỳỷỹỵ\s]/gi, ' ')
        .split(/\s+/)
        .filter((word) => word.length >= 3 && !stopwords.has(word));

    if (queryTerms.length === 0) {
        return { images: [] };
    }

    const regex = new RegExp(queryTerms.map(escapeRegExp).join('|'), 'i');
    const posts = await modelPost
        .find({
            $or: [{ title: regex }, { description: regex }, { location: regex }],
        })
        .limit(5);

    if (posts.length === 0) {
        return { images: [] };
    }

    if (posts.length === 1) {
        const post = posts[0];
        return {
            images: Array.isArray(post.images) ? post.images : [],
            postId: post._id.toString(),
            title: post.title,
        };
    }

    const images = posts.flatMap((post) => (Array.isArray(post.images) ? post.images : []));
    return {
        images,
        matches: posts.map((post) => ({
            postId: post._id.toString(),
            title: post.title,
            imagesCount: Array.isArray(post.images) ? post.images.length : 0,
        })),
    };
}

async function askQuestion(question) {
    try {
        if (isImageRequest(question)) {
            return await getImageResponse(question);
        }

        const products = await modelPost.find({});
        const productData = products.map((product) => `Tên ${product.title}, Giá : ${product.price}`).join('\n');

        const prompt = `
         Bạn là một trợ lý bán hàng chuyên nghiệp. 
        Đây là danh sách sản phẩm hiện có trong cửa hàng:
        ${productData}

        câu hỏi của khách hàng ${question}
        Hãy trả lời một cách tự nhiên và thân thiện
        `;

        const result = await model.generateContent(prompt);
        const answer = result.response.text();
        return answer;
    } catch (error) {
        console.log(error);
    }
}

module.exports = { askQuestion };
