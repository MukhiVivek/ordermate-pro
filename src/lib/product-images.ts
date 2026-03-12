
const PRODUCT_IMAGES_MAPPING: Record<string, string> = {
    'achar': '/products/achar-masala.jpg',
    'masala': '/products/achar-masala.jpg',
    'pickle': '/products/achar-masala.jpg',
    'besan': '/products/besan.jpg',
    'gram flour': '/products/besan.jpg',
    'chilli': '/products/chilli-powder.webp',
    'mirch': '/products/chilli-powder.webp',
    'powder': '/products/chilli-powder.webp',
    'teekha': '/products/hot-chilli.jpg',
    'dhanajiru': '/products/dhanajiru.jpg',
    'dhana': '/products/dhanajiru.jpg',
    'coriander': '/products/dhanajiru.jpg',
    'haldi': '/products/haldi.jpg',
    'turmeric': '/products/haldi.jpg',
    'hot chilli': '/products/hot-chilli.jpg',
    'maida': '/products/maida.png',
    'refined flour': '/products/maida.png',
    'moraiyo': '/products/moraiyo.jpg',
    'moriya': '/products/moraiyo.jpg',
    'ragi': '/products/ragi.jpg',
    'millet': '/products/ragi.jpg',
    'soji': '/products/soji.jpg',
};

// List of image paths that should be treated as "no image"
const PLACEHOLDER_IMAGES = [
    '/placeholder.svg',
    '/placeholder-product.jpg',
    '/placeholder.jpg',
    '/placeholder.png',
    'placeholder.svg',
    ''
];

/**
 * Identifies the best matching product image based on the product name.
 * 
 * Example:
 * name: "Besan Loose 1kg" -> identifies "besan" -> returns "/products/besan.jpg"
 */
export function getProductImage(name: string = '', currentImage?: string): string {
    // 1. If we have a real image (not a placeholder), use it
    if (currentImage &&
        !PLACEHOLDER_IMAGES.some(p => currentImage.includes(p)) &&
        currentImage.trim() !== '') {
        return currentImage;
    }

    const lowercaseName = (name || '').toLowerCase();

    // 2. Try phrase matching (matches "hot chilli" before "chilli")
    const keywords = Object.keys(PRODUCT_IMAGES_MAPPING).sort((a, b) => b.length - a.length);
    for (const keyword of keywords) {
        if (lowercaseName.includes(keyword)) {
            return PRODUCT_IMAGES_MAPPING[keyword];
        }
    }

    // 3. Try word-by-word matching
    const nameWords = lowercaseName.split(/\s+/);
    for (const word of nameWords) {
        if (PRODUCT_IMAGES_MAPPING[word]) {
            return PRODUCT_IMAGES_MAPPING[word];
        }
    }

    return '/placeholder.svg';
}
