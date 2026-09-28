import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    FiChevronDown,
    FiDownload,
    FiGlobe,
    FiImage,
    FiMinus,
    FiMove,
    FiPlus,
    FiRotateCcw,
    FiRotateCw,
    FiShield,
    FiUpload,
    FiZap,
} from 'react-icons/fi';
import { IoColorPaletteOutline } from 'react-icons/io5';
import { TbBrush, TbSparkles, TbWand } from 'react-icons/tb';

const MAX_HISTORY = 24;
const MANUAL_PATH_CLOSE_DISTANCE = 22;

const swatches = [
    '#ffffff', '#050505', '#a9a9a9', '#d9d9d9', '#f04444',
    '#ed81d3', '#ffc48d', '#ffd52e', '#8fe0ae', '#53c1e9',
    '#138bea', '#6757ea', '#8538d5',
    'linear-gradient(90deg, #ff4a4a, #ffd541, #34d399, #38bdf8)',
];

const presets = [
    { id: 'white', label: 'White', value: '#ffffff' },
    { id: 'blur', label: 'Blur', value: 'radial-gradient(circle, #f8fafc, #cbd5e1)' },
    { id: 'marble', label: 'Marble', value: 'linear-gradient(135deg, #f8fafc 0%, #dbe2ea 45%, #ffffff 48%, #ccd6e2 100%)' },
    { id: 'nature', label: 'Nature', value: 'linear-gradient(135deg, #184e2f, #8bcf64 45%, #d8f3c2)' },
    { id: 'city', label: 'City', value: 'linear-gradient(135deg, #0f172a, #2563eb 55%, #f59e0b)' },
];

const canonicalUrl = 'https://compudia.com/remove-background';
const seoTitle = 'Remove Background from Image Online Free';
const seoDescription = 'Remove background from images online with Compudia. Automatically detect the subject, refine the selection with manual brush tools, choose a transparent, color, or image background, and download.';
const socialImage = 'https://compudia.com/logo/compudia-logo.png';

const features = [
    { icon: TbSparkles, title: 'AI Powered', text: 'Automatic & precise' },
    { icon: TbBrush, title: 'Manual Selection', text: 'Refine with brush' },
    { icon: IoColorPaletteOutline, title: 'Any Background', text: 'Color or custom image' },
    { icon: FiImage, title: 'High Quality', text: 'Full resolution' },
    { icon: FiShield, title: 'Your Privacy', text: 'Browser-first editing' },
    { icon: FiZap, title: 'Free / No Signup', text: 'Start instantly' },
];

function getSegmentationConfigs(progress) {
    const configs = [];

    if (typeof navigator !== 'undefined' && navigator.gpu) {
        configs.push({ label: 'Precise local GPU', model: 'large', device: 'gpu' });
    }

    configs.push(
        { label: 'Precise local CPU', model: 'large', device: 'cpu' },
        { label: 'Standard local CPU', model: 'medium', device: 'cpu' },
        { label: 'Fast local CPU', model: 'small', device: 'cpu' },
    );

    return configs.map((config) => ({
        ...config,
        output: { format: 'image/png', quality: 1 },
        ...(progress ? { progress } : {}),
    }));
}

async function runLocalSegmentation(imageUrl, onProgress, onStage) {
    const { segmentForeground } = await import('@imgly/background-removal');
    let lastError = null;

    for (const config of getSegmentationConfigs(onProgress)) {
        try {
            onStage?.(`Loading ${config.label}...`);
            return await segmentForeground(imageUrl, config);
        } catch (error) {
            console.warn(`${config.label} failed`, error);
            lastError = error;
        }
    }

    throw lastError || new Error('Local segmentation failed.');
}

function Header() {
    return (
        <header className="site-header">
            <a className="brand" href="/" aria-label="Compudia home">
                <img className="brand-mark" src="/logo/compudia-logo.png" alt="" />
                <span className="brand-text"><strong>COMPU</strong>DIA</span>
            </a>
            <nav className="main-nav" aria-label="Main navigation">
                <div className="nav-menu">
                    <button type="button" aria-haspopup="true" aria-expanded="false">
                        Tools <FiChevronDown />
                    </button>
                    <div className="nav-submenu" role="menu">
                        <a className="active" href="/" role="menuitem">Remove Background</a>
                    </div>
                </div>
            </nav>
            <button className="language-button" type="button" aria-label="Change language">
                <FiGlobe /> EN <FiChevronDown />
            </button>
        </header>
    );
}

function BackgroundOptions({
    activeBackground,
    setActiveBackground,
    customColor,
    setCustomColor,
    backgroundType,
    setBackgroundType,
    backgroundImageUrl,
    onBackgroundImage,
}) {
    const imageInputRef = useRef(null);

    const handleImageFile = (file) => {
        if (!file?.type.startsWith('image/')) return;
        onBackgroundImage(file);
        setBackgroundType('image');
    };

    return (
        <section className="panel background-panel" aria-labelledby="background-title">
            <div className="panel-title" id="background-title">
                <FiImage />
                <span>Background Options</span>
            </div>

            <div className="segmented" role="tablist" aria-label="Background type">
                <button className={backgroundType === 'color' ? 'active' : ''} type="button" onClick={() => setBackgroundType('color')}>Color</button>
                <button className={backgroundType === 'image' ? 'active' : ''} type="button" onClick={() => setBackgroundType('image')}>Image</button>
                <button
                    className={backgroundType === 'transparent' ? 'active' : ''}
                    type="button"
                    onClick={() => {
                        setBackgroundType('transparent');
                        setActiveBackground('transparent');
                    }}
                >
                    Transparent
                </button>
            </div>

            {backgroundType === 'image' ? (
                <div className="background-image-picker">
                    <button className="soft-action" type="button" onClick={() => imageInputRef.current?.click()}>
                        <FiUpload /> {backgroundImageUrl ? 'Change Background Image' : 'Upload Background Image'}
                    </button>
                    {backgroundImageUrl && (
                        <div className="background-image-preview">
                            <img src={backgroundImageUrl} alt="Selected background" />
                        </div>
                    )}
                    <input
                        ref={imageInputRef}
                        className="sr-only"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => handleImageFile(event.target.files?.[0])}
                    />
                </div>
            ) : (
                <>
                    <div className="swatch-grid" aria-label="Color choices">
                        {swatches.map((color) => (
                            <button
                                key={color}
                                className={backgroundType === 'color' && activeBackground === color ? 'swatch active' : 'swatch'}
                                type="button"
                                style={{ background: color }}
                                onClick={() => {
                                    setBackgroundType('color');
                                    setActiveBackground(color);
                                }}
                                aria-label="Use background color"
                            />
                        ))}
                    </div>

                    <label className="custom-color">
                        <span>Custom Color</span>
                        <input
                            type="color"
                            value={customColor}
                            onChange={(event) => {
                                setCustomColor(event.target.value);
                                setBackgroundType('color');
                                setActiveBackground(event.target.value);
                            }}
                            aria-label="Choose custom background color"
                        />
                        <input
                            type="text"
                            value={customColor.toUpperCase()}
                            onChange={(event) => {
                                const value = event.target.value;
                                setCustomColor(value);
                                if (/^#[0-9a-f]{6}$/i.test(value)) {
                                    setBackgroundType('color');
                                    setActiveBackground(value);
                                }
                            }}
                            aria-label="Custom background HEX value"
                        />
                    </label>

                    <div className="preset-section">
                        <strong>Presets</strong>
                        <div className="preset-list">
                            {presets.map((preset) => (
                        <button
                            key={preset.id}
                            className={backgroundType === 'color' && activeBackground === preset.value ? 'preset active' : 'preset'}
                            type="button"
                            onClick={() => {
                                setBackgroundType('color');
                                setActiveBackground(preset.value);
                            }}
                        >
                            <span style={{ background: preset.value }} />
                            {preset.label}
                        </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}

function UploadCard({ onImage }) {
    const inputRef = useRef(null);

    const handleFiles = (files) => {
        const file = files?.[0];
        if (file?.type.startsWith('image/')) onImage(file);
    };

    return (
        <section
            className="panel upload-panel"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
                event.preventDefault();
                handleFiles(event.dataTransfer.files);
            }}
        >
            <div className="upload-dropzone">
                <div className="upload-icon">
                    <FiImage />
                    <span><FiPlus /></span>
                </div>
                <h2>Upload Image</h2>
                <p>Drag & drop an image here or click to browse</p>
                <button type="button" className="primary-button" onClick={() => inputRef.current?.click()}>
                    <FiUpload />
                    Choose Image
                </button>
                <small>Supports JPG, PNG, WEBP (Max 10MB)</small>
            </div>
            <input
                ref={inputRef}
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => handleFiles(event.target.files)}
            />
        </section>
    );
}

function FeatureStrip() {
    return (
        <section className="feature-strip" aria-label="Compudia features">
            {features.map((feature) => {
                const Icon = feature.icon;
                return (
                    <div className="feature" key={feature.title}>
                        <span><Icon /></span>
                        <strong>{feature.title}</strong>
                        <small>{feature.text}</small>
                    </div>
                );
            })}
        </section>
    );
}

function SeoContent() {
    const faqs = [
        {
            question: 'Can I download a transparent background image?',
            answer: 'Yes. After removing the original background, choose Transparent and download the result as a PNG.',
        },
        {
            question: 'Can I manually fix the background removal?',
            answer: 'Yes. Compudia includes manual selection and brush refinement tools so you can correct areas that automatic detection misses.',
        },
        {
            question: 'Can I change the background after removing it?',
            answer: 'Yes. You can choose a transparent background, a solid color, a preset background, or upload a background image.',
        },
    ];

    return (
        <section className="seo-content" aria-labelledby="seo-how-to-title">
            <div className="seo-content-inner">
                <section aria-labelledby="seo-how-to-title">
                    <h2 id="seo-how-to-title">How to Remove a Background</h2>
                    <ol>
                        <li>Upload a JPG, PNG, or WEBP image.</li>
                        <li>Let Compudia automatically detect the subject.</li>
                        <li>Refine the selection manually with brush tools if difficult edges, products, hair, or small details need correction.</li>
                        <li>Click Remove Background to preview the result.</li>
                        <li>Choose a transparent, white, color, or uploaded image background.</li>
                        <li>Download the final image.</li>
                    </ol>
                </section>

                <section aria-labelledby="seo-manual-title">
                    <h2 id="seo-manual-title">Manual Background Selection</h2>
                    <p>
                        Automatic background removal can struggle with fine details, product edges, fingers, hair, shadows, and multiple objects. Compudia is designed to let you review the detected mask and manually refine the background removal before downloading.
                    </p>
                </section>

                <section aria-labelledby="seo-transparent-title">
                    <h2 id="seo-transparent-title">Transparent Background</h2>
                    <p>
                        Use the Transparent background option when you need a PNG for ecommerce, profile images, product photos, thumbnails, or designs that must sit cleanly on another layout.
                    </p>
                </section>

                <section aria-labelledby="seo-change-title">
                    <h2 id="seo-change-title">Change Image Background</h2>
                    <p>
                        After the original background is removed, you can keep the result transparent, set a solid color, use a preset background, or upload your own image background where supported by the editor.
                    </p>
                </section>

                <section aria-labelledby="seo-faq-title">
                    <h2 id="seo-faq-title">FAQ</h2>
                    <div className="faq-list">
                        {faqs.map((faq) => (
                            <article key={faq.question}>
                                <h3>{faq.question}</h3>
                                <p>{faq.answer}</p>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </section>
    );
}

function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function cloneImageData(imageData) {
    return new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
}

function createFullMask(width, height, alpha = 255) {
    const imageData = new ImageData(width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 255;
        imageData.data[i + 1] = 255;
        imageData.data[i + 2] = 255;
        imageData.data[i + 3] = alpha;
    }
    return imageData;
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
    });
}

async function blobToImageData(blob, targetWidth, targetHeight) {
    const url = URL.createObjectURL(blob);
    try {
        const image = await loadImage(url);
        const canvas = createCanvas(targetWidth, targetHeight);
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, 0, 0, targetWidth, targetHeight);
        return context.getImageData(0, 0, targetWidth, targetHeight);
    } finally {
        URL.revokeObjectURL(url);
    }
}

function canvasToBlob(canvas, type = 'image/png', quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Could not prepare training image.'));
            }
        }, type, quality);
    });
}

async function imageDataToPngBlob(imageData) {
    const canvas = createCanvas(imageData.width, imageData.height);
    canvas.getContext('2d').putImageData(imageData, 0, 0);
    return canvasToBlob(canvas, 'image/png');
}

function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

async function requestRembgBackgroundRemoval(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch('/remove-background/rembg', {
        method: 'POST',
        body: formData,
        headers: {
            Accept: 'image/png',
            'X-CSRF-TOKEN': getCsrfToken(),
        },
    });

    if (!response.ok) {
        throw new Error(`AI background detection failed with status ${response.status}`);
    }

    return response.blob();
}

async function submitTrainingExample({
    originalBlob,
    originalName,
    initialMask,
    correctedMask,
    keepCorrections,
    removeCorrections,
    source,
    metadata,
}) {
    if (!originalBlob || !initialMask || !correctedMask) return null;

    const formData = new FormData();
    formData.append('original', originalBlob, originalName || 'original.png');
    formData.append('initial_mask', await imageDataToPngBlob(initialMask), 'initial-mask.png');
    formData.append('corrected_mask', await imageDataToPngBlob(correctedMask), 'corrected-mask.png');

    if (keepCorrections) {
        formData.append('keep_corrections', await imageDataToPngBlob(keepCorrections), 'keep-corrections.png');
    }

    if (removeCorrections) {
        formData.append('remove_corrections', await imageDataToPngBlob(removeCorrections), 'remove-corrections.png');
    }

    formData.append('source', source || 'auto-detect');
    formData.append('metadata', JSON.stringify(metadata || {}));

    const response = await fetch('/remove-background/training-example', {
        method: 'POST',
        body: formData,
        headers: {
            Accept: 'application/json',
            'X-CSRF-TOKEN': getCsrfToken(),
        },
    });

    if (!response.ok) {
        throw new Error(`Training example save failed with status ${response.status}`);
    }

    return response.json();
}

function normalizeMask(imageData) {
    const normalized = cloneImageData(imageData);
    let minAlpha = 255;
    let maxAlpha = 0;

    for (let i = 0; i < normalized.data.length; i += 4) {
        const alpha = normalized.data[i + 3];
        minAlpha = Math.min(minAlpha, alpha);
        maxAlpha = Math.max(maxAlpha, alpha);
    }

    const useAlphaChannel = maxAlpha - minAlpha > 8;

    for (let i = 0; i < normalized.data.length; i += 4) {
        const value = useAlphaChannel
            ? normalized.data[i + 3]
            : Math.max(normalized.data[i], normalized.data[i + 1], normalized.data[i + 2]);
        normalized.data[i] = 255;
        normalized.data[i + 1] = 255;
        normalized.data[i + 2] = 255;
        normalized.data[i + 3] = value;
    }
    return normalized;
}

function mergeMasksForResultRefinement(currentMask, detectedMask) {
    const current = normalizeMask(currentMask);
    const detected = normalizeMask(detectedMask);
    const refined = cloneImageData(current);

    for (let i = 0; i < refined.data.length; i += 4) {
        refined.data[i] = 255;
        refined.data[i + 1] = 255;
        refined.data[i + 2] = 255;
        refined.data[i + 3] = Math.min(current.data[i + 3], detected.data[i + 3]);
    }

    return refined;
}

function applyManualCorrectionMemory(maskData, keepCorrections, removeCorrections) {
    const corrected = cloneImageData(maskData);

    for (let i = 0; i < corrected.data.length; i += 4) {
        if (keepCorrections?.data[i + 3] > 80) {
            corrected.data[i + 3] = 255;
        }
        if (removeCorrections?.data[i + 3] > 80) {
            corrected.data[i + 3] = 0;
        }
    }

    return corrected;
}

function sharpenMaskEdges(maskData) {
    const sharpened = cloneImageData(maskData);

    for (let i = 0; i < sharpened.data.length; i += 4) {
        const alpha = sharpened.data[i + 3];
        const nextAlpha = alpha <= 18
            ? 0
            : alpha >= 220
                ? 255
                : Math.round(255 / (1 + Math.exp(-((alpha - 112) / 24))));

        sharpened.data[i] = 255;
        sharpened.data[i + 1] = 255;
        sharpened.data[i + 2] = 255;
        sharpened.data[i + 3] = nextAlpha;
    }

    return sharpened;
}

function removeSmallMaskIslands(maskData, minimumPixels = 36) {
    const cleaned = cloneImageData(maskData);
    const { width, height, data } = cleaned;
    const visited = new Uint8Array(width * height);

    for (let start = 0; start < width * height; start += 1) {
        if (visited[start] || data[(start * 4) + 3] < 24) continue;

        const queue = [start];
        const component = [];
        visited[start] = 1;

        let queueIndex = 0;

        while (queueIndex < queue.length) {
            const pixelIndex = queue[queueIndex];
            queueIndex += 1;
            component.push(pixelIndex);

            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            const neighbors = [
                x > 0 ? pixelIndex - 1 : -1,
                x < width - 1 ? pixelIndex + 1 : -1,
                y > 0 ? pixelIndex - width : -1,
                y < height - 1 ? pixelIndex + width : -1,
            ];

            for (const neighbor of neighbors) {
                if (neighbor >= 0 && !visited[neighbor] && data[(neighbor * 4) + 3] >= 24) {
                    visited[neighbor] = 1;
                    queue.push(neighbor);
                }
            }
        }

        if (component.length >= minimumPixels) continue;

        component.forEach((pixelIndex) => {
            data[(pixelIndex * 4) + 3] = 0;
        });
    }

    return cleaned;
}

function estimateBorderBackground(imageData) {
    const { width, height, data } = imageData;
    const step = Math.max(1, Math.floor(Math.min(width, height) / 80));
    const border = Math.max(3, Math.floor(Math.min(width, height) * 0.035));
    const samples = [];

    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            if (x > border && x < width - border && y > border && y < height - border) continue;
            const index = (y * width + x) * 4;
            samples.push([data[index], data[index + 1], data[index + 2]]);
        }
    }

    if (!samples.length) return null;

    samples.sort((a, b) => ((a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2])));
    const middle = samples.slice(Math.floor(samples.length * 0.18), Math.ceil(samples.length * 0.82));
    const pool = middle.length ? middle : samples;
    const average = pool.reduce((sum, color) => {
        sum.r += color[0];
        sum.g += color[1];
        sum.b += color[2];
        return sum;
    }, { r: 0, g: 0, b: 0 });

    return {
        r: average.r / pool.length,
        g: average.g / pool.length,
        b: average.b / pool.length,
    };
}

function removeBorderConnectedBackground(maskData, imageData) {
    if (!maskData || !imageData) return maskData;

    const background = estimateBorderBackground(imageData);
    if (!background) return maskData;

    const refined = cloneImageData(maskData);
    const { width, height } = refined;
    const visited = new Uint8Array(width * height);
    const queue = [];
    const tolerance = 72;
    const softTolerance = 92;

    const enqueue = (x, y) => {
        const pixelIndex = y * width + x;
        if (!visited[pixelIndex]) {
            visited[pixelIndex] = 1;
            queue.push(pixelIndex);
        }
    };

    for (let x = 0; x < width; x += 1) {
        enqueue(x, 0);
        enqueue(x, height - 1);
    }
    for (let y = 0; y < height; y += 1) {
        enqueue(0, y);
        enqueue(width - 1, y);
    }

    let queueIndex = 0;

    while (queueIndex < queue.length) {
        const pixelIndex = queue[queueIndex];
        queueIndex += 1;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        const dataIndex = pixelIndex * 4;
        const distance = colorDistance(imageData.data, dataIndex, background);
        const currentAlpha = refined.data[dataIndex + 3];

        if (distance <= tolerance || (distance <= softTolerance && currentAlpha < 210)) {
            refined.data[dataIndex + 3] = 0;

            const neighbors = [
                x > 0 ? pixelIndex - 1 : -1,
                x < width - 1 ? pixelIndex + 1 : -1,
                y > 0 ? pixelIndex - width : -1,
                y < height - 1 ? pixelIndex + width : -1,
            ];

            for (const neighbor of neighbors) {
                if (neighbor >= 0 && !visited[neighbor]) {
                    visited[neighbor] = 1;
                    queue.push(neighbor);
                }
            }
        }
    }

    return refined;
}

function repairLightProductInterior(maskData, imageData) {
    if (!maskData || !imageData) return maskData;

    const repaired = cloneImageData(maskData);
    const { width, height, data } = repaired;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let foregroundPixels = 0;

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const index = (y * width + x) * 4;
            if (data[index + 3] > 48) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
                foregroundPixels += 1;
            }
        }
    }

    if (!foregroundPixels) return repaired;

    const boxWidth = maxX - minX + 1;
    const boxHeight = maxY - minY + 1;
    const isWideProduct = boxWidth / Math.max(1, width) > 0.32 && boxWidth / Math.max(1, boxHeight) > 1.15;

    if (!isWideProduct) return repaired;

    const background = estimateBorderBackground(imageData);
    const expandX = Math.round(boxWidth * 0.9);
    const expandY = Math.round(boxHeight * 0.38);
    const left = Math.max(0, minX - expandX);
    const right = Math.min(width - 1, maxX + expandX);
    const top = Math.max(0, minY - expandY);
    const bottom = Math.min(height - 1, maxY + expandY);

    for (let y = top; y <= bottom; y += 1) {
        for (let x = left; x <= right; x += 1) {
            const index = (y * width + x) * 4;
            if (data[index + 3] > 16) continue;

            const r = imageData.data[index];
            const g = imageData.data[index + 1];
            const b = imageData.data[index + 2];
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max ? (max - min) / max : 0;
            const distanceFromBackground = background ? colorDistance(imageData.data, index, background) : 80;
            const isLightProductSurface = max >= 142 && saturation <= 0.34 && distanceFromBackground >= 36;

            if (isLightProductSurface) {
                data[index] = 255;
                data[index + 1] = 255;
                data[index + 2] = 255;
                data[index + 3] = 255;
            }
        }
    }

    return repaired;
}

function repairWideContainerSurface(maskData, imageData) {
    if (!maskData || !imageData) return maskData;

    const repaired = cloneImageData(maskData);
    const { width, height, data } = repaired;
    const topByX = new Int32Array(width).fill(-1);
    const bottomByX = new Int32Array(width).fill(-1);
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let activeColumns = 0;

    for (let x = 0; x < width; x += 1) {
        for (let y = 0; y < height; y += 1) {
            const alpha = data[(y * width + x) * 4 + 3];
            if (alpha <= 42) continue;

            if (topByX[x] === -1) topByX[x] = y;
            bottomByX[x] = y;
        }

        if (topByX[x] !== -1) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, topByX[x]);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, bottomByX[x]);
            activeColumns += 1;
        }
    }

    if (!activeColumns) return repaired;

    const productWidthRatio = (maxX - minX + 1) / width;
    const boxWidth = maxX - minX + 1;
    const boxHeight = maxY - minY + 1;
    const boxAspect = boxWidth / Math.max(1, boxHeight);
    const isWideObject = productWidthRatio >= 0.48 && boxAspect >= 1.12;

    if (!isWideObject) return repaired;

    const fillMissingEdges = (edges) => {
        let last = -1;
        for (let x = 0; x < width; x += 1) {
            if (edges[x] !== -1) last = edges[x];
            else if (last !== -1) edges[x] = last;
        }

        last = -1;
        for (let x = width - 1; x >= 0; x -= 1) {
            if (edges[x] !== -1) last = edges[x];
            else if (last !== -1) edges[x] = last;
        }
    };

    fillMissingEdges(topByX);
    fillMissingEdges(bottomByX);

    const background = estimateBorderBackground(imageData);
    const left = Math.max(0, minX - Math.round(width * 0.03));
    const right = Math.min(width - 1, maxX + Math.round(width * 0.03));

    for (let x = left; x <= right; x += 1) {
        if (topByX[x] === -1 || bottomByX[x] === -1) continue;

        const top = Math.max(0, topByX[x] - Math.round(height * 0.015));
        const bottom = Math.min(height - 1, bottomByX[x] + Math.round(height * 0.015));
        if (bottom - top < height * 0.18) continue;

        for (let y = top; y <= bottom; y += 1) {
            const index = (y * width + x) * 4;
            if (data[index + 3] > 32) continue;

            const r = imageData.data[index];
            const g = imageData.data[index + 1];
            const b = imageData.data[index + 2];
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max ? (max - min) / max : 0;
            const distanceFromBackground = background ? colorDistance(imageData.data, index, background) : 80;
            const isContainerSurface = max >= 126 && saturation <= 0.48 && distanceFromBackground >= 22;

            if (isContainerSurface) {
                data[index] = 255;
                data[index + 1] = 255;
                data[index + 2] = 255;
                data[index + 3] = 255;
            }
        }
    }

    return repaired;
}

function isSkinTone(data, index) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    return r >= 82
        && g >= 48
        && b >= 32
        && r > b + 16
        && g > b + 2
        && r - g < 92
        && max - min > 16
        && max < 248;
}

function hasNearbyForeground(maskData, x, y, radius) {
    const { width, height, data } = maskData;
    const minX = Math.max(0, x - radius);
    const maxX = Math.min(width - 1, x + radius);
    const minY = Math.max(0, y - radius);
    const maxY = Math.min(height - 1, y + radius);
    const radiusSquared = radius * radius;

    for (let yy = minY; yy <= maxY; yy += 1) {
        for (let xx = minX; xx <= maxX; xx += 1) {
            if (((xx - x) ** 2) + ((yy - y) ** 2) > radiusSquared) continue;
            if (data[(yy * width + xx) * 4 + 3] > 170) return true;
        }
    }

    return false;
}

function repairPortraitSkinDetails(maskData, imageData) {
    if (!maskData || !imageData) return maskData;

    const repaired = cloneImageData(maskData);
    const { width, height, data } = repaired;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let foregroundPixels = 0;

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const index = (y * width + x) * 4;
            if (data[index + 3] <= 48) continue;

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            foregroundPixels += 1;
        }
    }

    if (!foregroundPixels) return repaired;

    const boxWidth = maxX - minX + 1;
    const boxHeight = maxY - minY + 1;
    const boxAspect = boxWidth / Math.max(1, boxHeight);
    const isPortraitShape = boxAspect < 1.12 && boxHeight / height > 0.42;

    if (!isPortraitShape) return repaired;

    const left = Math.max(0, minX - Math.round(boxWidth * 0.16));
    const right = Math.min(width - 1, maxX + Math.round(boxWidth * 0.16));
    const top = Math.max(0, minY + Math.round(boxHeight * 0.02));
    const bottom = Math.min(height - 1, minY + Math.round(boxHeight * 0.52));
    const radius = Math.max(10, Math.round(Math.min(width, height) * 0.018));

    for (let pass = 0; pass < 2; pass += 1) {
        const source = cloneImageData(repaired);

        for (let y = top; y <= bottom; y += 1) {
            for (let x = left; x <= right; x += 1) {
                const index = (y * width + x) * 4;
                if (data[index + 3] > 76) continue;
                if (!isSkinTone(imageData.data, index)) continue;
                if (!hasNearbyForeground(source, x, y, radius)) continue;

                data[index] = 255;
                data[index + 1] = 255;
                data[index + 2] = 255;
                data[index + 3] = 255;
            }
        }
    }

    return repaired;
}

function repairPortraitBodyInterior(maskData, imageData) {
    if (!maskData || !imageData) return maskData;

    const repaired = cloneImageData(maskData);
    const { width, height, data } = repaired;
    const background = estimateBorderBackground(imageData);
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let foregroundPixels = 0;

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const index = (y * width + x) * 4;
            if (data[index + 3] <= 48) continue;

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            foregroundPixels += 1;
        }
    }

    if (!foregroundPixels) return repaired;

    const boxWidth = maxX - minX + 1;
    const boxHeight = maxY - minY + 1;
    const boxAspect = boxWidth / Math.max(1, boxHeight);
    const isPortraitShape = boxAspect < 1.14 && boxHeight / height > 0.42;

    if (!isPortraitShape) return repaired;

    const startY = Math.max(minY, Math.round(minY + (boxHeight * 0.48)));
    const endY = maxY;
    const minSpan = Math.max(12, Math.round(boxWidth * 0.34));
    const rowPadding = Math.max(3, Math.round(boxWidth * 0.018));
    const neighborRadius = Math.max(5, Math.round(Math.min(width, height) * 0.012));

    for (let y = startY; y <= endY; y += 1) {
        let left = width;
        let right = 0;
        let rowForeground = 0;

        for (let x = minX; x <= maxX; x += 1) {
            const alpha = data[(y * width + x) * 4 + 3];
            if (alpha <= 150) continue;

            left = Math.min(left, x);
            right = Math.max(right, x);
            rowForeground += 1;
        }

        if (rowForeground < minSpan || right - left < minSpan) continue;

        const fillLeft = Math.max(minX, left - rowPadding);
        const fillRight = Math.min(maxX, right + rowPadding);

        for (let x = fillLeft; x <= fillRight; x += 1) {
            const index = (y * width + x) * 4;
            if (data[index + 3] > 120) continue;

            const isClearlyNotBackground = background
                ? colorDistance(imageData.data, index, background) > 58
                : true;
            const nearForeground = hasNearbyForeground(repaired, x, y, neighborRadius);

            if (!isClearlyNotBackground && !nearForeground) continue;

            data[index] = 255;
            data[index + 1] = 255;
            data[index + 2] = 255;
            data[index + 3] = 255;
        }
    }

    return repaired;
}

function removePortraitDetachedForeground(maskData) {
    if (!maskData) return maskData;

    const cleaned = cloneImageData(maskData);
    const { width, height, data } = cleaned;
    const visited = new Uint8Array(width * height);
    const components = [];

    for (let start = 0; start < width * height; start += 1) {
        if (visited[start] || data[(start * 4) + 3] <= 96) continue;

        const queue = [start];
        const pixels = [];
        visited[start] = 1;
        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;
        let queueIndex = 0;

        while (queueIndex < queue.length) {
            const pixelIndex = queue[queueIndex];
            queueIndex += 1;
            pixels.push(pixelIndex);

            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);

            const neighbors = [
                x > 0 ? pixelIndex - 1 : -1,
                x < width - 1 ? pixelIndex + 1 : -1,
                y > 0 ? pixelIndex - width : -1,
                y < height - 1 ? pixelIndex + width : -1,
            ];

            for (const neighbor of neighbors) {
                if (neighbor >= 0 && !visited[neighbor] && data[(neighbor * 4) + 3] > 96) {
                    visited[neighbor] = 1;
                    queue.push(neighbor);
                }
            }
        }

        components.push({ pixels, minX, minY, maxX, maxY });
    }

    if (components.length <= 1) return cleaned;

    components.sort((a, b) => b.pixels.length - a.pixels.length);
    const main = components[0];
    const mainWidth = main.maxX - main.minX + 1;
    const mainHeight = main.maxY - main.minY + 1;
    const mainAspect = mainWidth / Math.max(1, mainHeight);
    const isPortraitShape = mainAspect < 1.14 && mainHeight / height > 0.42;

    if (!isPortraitShape) return cleaned;

    const keepDistance = Math.max(3, Math.round(Math.min(width, height) * 0.01));
    const maxDetachedPixels = Math.max(16, Math.round(main.pixels.length * 0.08));

    components.slice(1).forEach((component) => {
        const touchesMainBounds = component.maxX >= main.minX - keepDistance
            && component.minX <= main.maxX + keepDistance
            && component.maxY >= main.minY - keepDistance
            && component.minY <= main.maxY + keepDistance;
        const isLargeSecondarySubject = component.pixels.length > maxDetachedPixels && touchesMainBounds;

        if (isLargeSecondarySubject) return;

        component.pixels.forEach((pixelIndex) => {
            data[(pixelIndex * 4) + 3] = 0;
        });
    });

    return cleaned;
}

function refineAutoDetectedMask(maskData, imageData) {
    const sharpened = sharpenMaskEdges(maskData);
    const repairedProduct = repairLightProductInterior(sharpened, imageData);
    const repairedContainer = repairWideContainerSurface(repairedProduct, imageData);
    const backgroundRemoved = removeBorderConnectedBackground(repairedContainer, imageData);
    const repairedPortrait = repairPortraitSkinDetails(backgroundRemoved, imageData);
    const repairedBody = repairPortraitBodyInterior(repairedPortrait, imageData);
    const portraitMainSubject = removePortraitDetachedForeground(repairedBody);
    return removeSmallMaskIslands(portraitMainSubject);
}

function paintMask(maskData, centerX, centerY, radius, hardness, mode) {
    const data = maskData.data;
    const hardRadius = radius * (hardness / 100);
    const minX = Math.max(0, Math.floor(centerX - radius));
    const maxX = Math.min(maskData.width - 1, Math.ceil(centerX + radius));
    const minY = Math.max(0, Math.floor(centerY - radius));
    const maxY = Math.min(maskData.height - 1, Math.ceil(centerY + radius));

    for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
            const distance = Math.hypot(x - centerX, y - centerY);
            if (distance > radius) continue;

            const falloff = distance <= hardRadius
                ? 1
                : 1 - ((distance - hardRadius) / Math.max(1, radius - hardRadius));
            const index = (y * maskData.width + x) * 4;
            const target = mode === 'keep' ? 255 : 0;
            const current = data[index + 3];

            data[index] = 255;
            data[index + 1] = 255;
            data[index + 2] = 255;
            data[index + 3] = Math.max(0, Math.min(255, current + ((target - current) * falloff)));
        }
    }
}

function sampleImageColor(imageData, centerX, centerY) {
    if (!imageData) return null;

    const sampleRadius = 1;
    const minX = Math.max(0, Math.floor(centerX - sampleRadius));
    const maxX = Math.min(imageData.width - 1, Math.ceil(centerX + sampleRadius));
    const minY = Math.max(0, Math.floor(centerY - sampleRadius));
    const maxY = Math.min(imageData.height - 1, Math.ceil(centerY + sampleRadius));
    const color = { r: 0, g: 0, b: 0, count: 0 };

    for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
            if (Math.hypot(x - centerX, y - centerY) > sampleRadius) continue;
            const index = (y * imageData.width + x) * 4;
            color.r += imageData.data[index];
            color.g += imageData.data[index + 1];
            color.b += imageData.data[index + 2];
            color.count += 1;
        }
    }

    if (!color.count) return null;

    return {
        ...color,
        colors: [{ r: color.r / color.count, g: color.g / color.count, b: color.b / color.count }],
    };
}

function mergeColorSample(target, sample) {
    if (!sample) return target;
    return {
        r: target.r + sample.r,
        g: target.g + sample.g,
        b: target.b + sample.b,
        count: target.count + sample.count,
        colors: [...(target.colors || []), ...(sample.colors || [])].slice(-30),
    };
}

function colorDistance(pixelData, index, color) {
    const dr = pixelData[index] - color.r;
    const dg = pixelData[index + 1] - color.g;
    const db = pixelData[index + 2] - color.b;
    return Math.sqrt((dr * dr * 0.75) + (dg * dg) + (db * db * 0.75));
}

function dominantSampleColor(sample) {
    if (!sample?.count) return null;
    return {
        r: sample.r / sample.count,
        g: sample.g / sample.count,
        b: sample.b / sample.count,
    };
}

function removeSimilarColorComponents(maskData, imageData, sample, seedPoints, tolerance = 42) {
    if (!maskData || !imageData || !sample?.count) return 0;

    const sampleColor = dominantSampleColor(sample);
    const { width, height } = maskData;
    const visited = new Uint8Array(width * height);
    const matched = new Uint8Array(width * height);
    const seedSet = new Set();
    const maxComponentPixels = Math.floor(width * height * 0.045);
    let removed = 0;

    seedPoints.forEach((point) => {
        const x = Math.max(0, Math.min(width - 1, Math.round(point.x)));
        const y = Math.max(0, Math.min(height - 1, Math.round(point.y)));
        seedSet.add(y * width + x);
    });

    for (let pixelIndex = 0; pixelIndex < width * height; pixelIndex += 1) {
        const dataIndex = pixelIndex * 4;
        matched[pixelIndex] = colorDistance(imageData.data, dataIndex, sampleColor) <= tolerance ? 1 : 0;
    }

    for (let start = 0; start < matched.length; start += 1) {
        if (!matched[start] || visited[start]) continue;

        const queue = [start];
        const component = [];
        let touchesEdge = false;
        let touchesSeed = false;
        visited[start] = 1;

        while (queue.length) {
            const pixelIndex = queue.shift();
            component.push(pixelIndex);

            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            touchesEdge = touchesEdge || x === 0 || y === 0 || x === width - 1 || y === height - 1;
            touchesSeed = touchesSeed || seedSet.has(pixelIndex);

            const neighbors = [
                x > 0 ? pixelIndex - 1 : -1,
                x < width - 1 ? pixelIndex + 1 : -1,
                y > 0 ? pixelIndex - width : -1,
                y < height - 1 ? pixelIndex + width : -1,
            ];

            for (const neighbor of neighbors) {
                if (neighbor >= 0 && matched[neighbor] && !visited[neighbor]) {
                    visited[neighbor] = 1;
                    queue.push(neighbor);
                }
            }
        }

        if ((!touchesEdge && !touchesSeed) || component.length > maxComponentPixels) continue;

        component.forEach((pixelIndex) => {
            const dataIndex = pixelIndex * 4;
            if (maskData.data[dataIndex + 3] >= 8) {
                maskData.data[dataIndex + 3] = 0;
                removed += 1;
            }
        });
    }

    return removed;
}

function drawCheckerboard(context, width, height, size = 24) {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#d8d8d8';
    for (let y = 0; y < height; y += size) {
        for (let x = 0; x < width; x += size) {
            if (((x / size) + (y / size)) % 2 === 0) {
                context.fillRect(x, y, size, size);
            }
        }
    }
}

function drawCoverImage(context, imageCanvas, width, height) {
    const scale = Math.max(width / imageCanvas.width, height / imageCanvas.height);
    const drawWidth = imageCanvas.width * scale;
    const drawHeight = imageCanvas.height * scale;
    context.drawImage(imageCanvas, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

function fillCanvasBackground(context, width, height, background, backgroundImageCanvas = null) {
    if (background === 'image' && backgroundImageCanvas) {
        drawCoverImage(context, backgroundImageCanvas, width, height);
        return;
    }

    if (background === 'transparent') {
        drawCheckerboard(context, width, height);
        return;
    }

    if (background.startsWith('#')) {
        context.fillStyle = background;
    } else {
        const gradient = context.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#f8fafc');
        gradient.addColorStop(0.55, '#9edb8b');
        gradient.addColorStop(1, '#2563eb');
        context.fillStyle = gradient;
    }
    context.fillRect(0, 0, width, height);
}

function drawSubject(context, imageCanvas, maskData) {
    const temp = createCanvas(maskData.width, maskData.height);
    const tempContext = temp.getContext('2d', { willReadFrequently: true });
    tempContext.drawImage(imageCanvas, 0, 0);

    const subject = tempContext.getImageData(0, 0, maskData.width, maskData.height);
    for (let i = 0; i < subject.data.length; i += 4) {
        subject.data[i + 3] = Math.round((subject.data[i + 3] * maskData.data[i + 3]) / 255);
    }

    tempContext.putImageData(subject, 0, 0);
    context.drawImage(temp, 0, 0);
}

function drawMaskOverlay(context, maskData) {
    const overlay = context.createImageData(maskData.width, maskData.height);
    for (let i = 0; i < maskData.data.length; i += 4) {
        const alpha = maskData.data[i + 3];
        if (alpha > 8) {
            overlay.data[i] = 53;
            overlay.data[i + 1] = 169;
            overlay.data[i + 2] = 31;
            overlay.data[i + 3] = Math.min(96, alpha * 0.36);
        }
    }

    const overlayCanvas = createCanvas(maskData.width, maskData.height);
    overlayCanvas.getContext('2d').putImageData(overlay, 0, 0);
    context.drawImage(overlayCanvas, 0, 0);
}

function drawMaskEdges(context, maskData) {
    const { width, height, data } = maskData;
    const edge = context.createImageData(width, height);

    for (let y = 1; y < height - 1; y += 1) {
        for (let x = 1; x < width - 1; x += 1) {
            const index = (y * width + x) * 4;
            const alpha = data[index + 3];
            const left = data[(y * width + x - 1) * 4 + 3];
            const right = data[(y * width + x + 1) * 4 + 3];
            const top = data[((y - 1) * width + x) * 4 + 3];
            const bottom = data[((y + 1) * width + x) * 4 + 3];
            const contrast = Math.max(Math.abs(alpha - left), Math.abs(alpha - right), Math.abs(alpha - top), Math.abs(alpha - bottom));

            if (contrast > 90 || (alpha > 32 && alpha < 238)) {
                edge.data[index] = 53;
                edge.data[index + 1] = 169;
                edge.data[index + 2] = 31;
                edge.data[index + 3] = 255;
            }
        }
    }

    const edgeCanvas = createCanvas(width, height);
    edgeCanvas.getContext('2d').putImageData(edge, 0, 0);
    context.drawImage(edgeCanvas, 0, 0);
}

function drawRemovalOverlay(context, maskData) {
    const overlay = context.createImageData(maskData.width, maskData.height);
    for (let i = 0; i < maskData.data.length; i += 4) {
        const removed = 255 - maskData.data[i + 3];
        if (removed > 8) {
            overlay.data[i] = 244;
            overlay.data[i + 1] = 63;
            overlay.data[i + 2] = 94;
            overlay.data[i + 3] = Math.min(140, removed * 0.48);
        }
    }

    const overlayCanvas = createCanvas(maskData.width, maskData.height);
    overlayCanvas.getContext('2d').putImageData(overlay, 0, 0);
    context.drawImage(overlayCanvas, 0, 0);
}

function drawRemovalEdges(context, maskData) {
    const { width, height, data } = maskData;
    const edge = context.createImageData(width, height);

    for (let y = 1; y < height - 1; y += 1) {
        for (let x = 1; x < width - 1; x += 1) {
            const index = (y * width + x) * 4;
            const alpha = data[index + 3];
            const left = data[(y * width + x - 1) * 4 + 3];
            const right = data[(y * width + x + 1) * 4 + 3];
            const top = data[((y - 1) * width + x) * 4 + 3];
            const bottom = data[((y + 1) * width + x) * 4 + 3];
            const contrast = Math.max(Math.abs(alpha - left), Math.abs(alpha - right), Math.abs(alpha - top), Math.abs(alpha - bottom));

            if ((alpha < 238 && contrast > 70) || (alpha > 8 && alpha < 238)) {
                edge.data[index] = 244;
                edge.data[index + 1] = 63;
                edge.data[index + 2] = 94;
                edge.data[index + 3] = 255;
            }
        }
    }

    const edgeCanvas = createCanvas(width, height);
    edgeCanvas.getContext('2d').putImageData(edge, 0, 0);
    context.drawImage(edgeCanvas, 0, 0);
}

function drawManualPath(context, points) {
    if (!points.length) return;

    context.save();
    context.lineWidth = 4;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.strokeStyle = '#94c044';
    context.shadowColor = 'rgba(7, 16, 38, 0.28)';
    context.shadowBlur = 5;
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
    context.stroke();
    context.restore();
}

function drawBrushPreview(context, point, radius, mode) {
    if (!point || mode === 'pen') return;

    context.save();
    context.lineWidth = 2;
    context.setLineDash([7, 5]);
    context.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    context.shadowColor = 'rgba(7, 16, 38, 0.42)';
    context.shadowBlur = 4;
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.stroke();

    context.lineWidth = 1.35;
    context.setLineDash([]);
    context.shadowBlur = 0;
    context.strokeStyle = mode === 'restore' ? '#16a34a' : '#f43f5e';
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.stroke();
    context.restore();
}

function fillMaskPath(maskData, points, mode) {
    if (points.length < 3) return maskData;

    const canvas = createCanvas(maskData.width, maskData.height);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.putImageData(maskData, 0, 0);
    context.globalCompositeOperation = 'source-over';
    context.fillStyle = mode === 'keep' ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0)';
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
    context.closePath();

    if (mode === 'keep') {
        context.fill();
    } else {
        context.globalCompositeOperation = 'destination-out';
        context.fillStyle = 'rgba(0,0,0,1)';
        context.fill();
    }

    return normalizeMask(context.getImageData(0, 0, maskData.width, maskData.height));
}

function isEmptyMask(maskData) {
    for (let i = 3; i < maskData.data.length; i += 4) {
        if (maskData.data[i] > 0) return false;
    }
    return true;
}

function isFullMask(maskData) {
    for (let i = 3; i < maskData.data.length; i += 4) {
        if (maskData.data[i] < 255) return false;
    }
    return true;
}

function createOutputCanvas(imageCanvas, maskData, background, backgroundImageCanvas = null) {
    const output = createCanvas(maskData.width, maskData.height);
    const context = output.getContext('2d');

    if (background !== 'transparent') {
        fillCanvasBackground(context, output.width, output.height, background, backgroundImageCanvas);
    }
    drawSubject(context, imageCanvas, maskData);
    return output;
}

function createPreviewImages(imageCanvas, maskData, background, backgroundImageCanvas = null) {
    if (!imageCanvas || !maskData) return null;

    const original = createCanvas(imageCanvas.width, imageCanvas.height);
    original.getContext('2d').drawImage(imageCanvas, 0, 0);

    const maskPreview = createCanvas(maskData.width, maskData.height);
    const maskContext = maskPreview.getContext('2d');
    maskContext.drawImage(imageCanvas, 0, 0);
    drawMaskOverlay(maskContext, maskData);
    drawMaskEdges(maskContext, maskData);

    const output = createOutputCanvas(imageCanvas, maskData, background, backgroundImageCanvas);

    const transparent = createCanvas(maskData.width, maskData.height);
    drawSubject(transparent.getContext('2d'), imageCanvas, maskData);

    return {
        original: original.toDataURL('image/jpeg', 0.86),
        mask: maskPreview.toDataURL('image/png'),
        output: output.toDataURL('image/png'),
        transparent: transparent.toDataURL('image/png'),
    };
}

function getCanvasPoint(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: ((event.clientX - rect.left) / rect.width) * canvas.width,
        y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
}

function SelectionPanel({
    editorMode,
    setEditorMode,
    manualTool,
    setManualTool,
    brushSize,
    setBrushSize,
    hardness,
    setHardness,
    zoom,
    setZoom,
    panMode,
    setPanMode,
    onSelectManually,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onAutoDetect,
    onRestoreSelection,
    onRemoveBackground,
    onStartOver,
    isDetecting,
    hasMask,
    backgroundRemoved,
    status,
}) {
    return (
        <section className="panel selection-panel" aria-labelledby="selection-title">
            <div className="panel-title" id="selection-title">
                <TbBrush />
                <span>Edit Selection</span>
            </div>

            <div className="editor-mode-stack" aria-label="Editor view">
                <button className={editorMode === 'original' ? 'active' : ''} type="button" onClick={() => setEditorMode('original')}>
                    Original Photo
                </button>
                <button className={editorMode === 'mask' ? 'active' : ''} type="button" onClick={onSelectManually}>
                    Select Manually
                </button>
                {editorMode === 'mask' && (
                    <div className="manual-tool-menu">
                        <button
                            className={manualTool === 'brush' ? 'active' : ''}
                            type="button"
                            onClick={() => {
                                setManualTool('brush');
                            }}
                        >
                            Brush Tool / Similar Area
                        </button>
                        <button
                            className={manualTool === 'restore' ? 'active' : ''}
                            type="button"
                            onClick={() => {
                                setManualTool('restore');
                                onRestoreSelection?.();
                            }}
                        >
                            Unselect Path
                        </button>
                        <button
                            className={manualTool === 'pen' ? 'active' : ''}
                            type="button"
                            onClick={() => {
                                setManualTool('pen');
                            }}
                        >
                            Select with Pen
                        </button>
                    </div>
                )}
                <button className={editorMode === 'result' ? 'active' : ''} type="button" onClick={() => setEditorMode('result')} disabled={!backgroundRemoved}>
                    Preview Result
                </button>
            </div>

            {editorMode === 'mask' && (
                <>
                    <label className="range-field">
                        <span>Brush Size</span>
                        <input type="range" min="4" max="120" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} />
                        <strong>{brushSize} px</strong>
                    </label>

                    <label className="range-field">
                        <span>Brush Hardness</span>
                        <input type="range" min="10" max="100" value={hardness} onChange={(event) => setHardness(Number(event.target.value))} />
                        <strong>{hardness}%</strong>
                    </label>
                </>
            )}

            <button className="soft-action" type="button" onClick={() => onAutoDetect?.()} disabled={isDetecting || !onAutoDetect}>
                <TbWand /> {isDetecting ? 'Detecting...' : backgroundRemoved ? 'Refine Auto' : 'Auto Detect'}
            </button>

            <button className="soft-action" type="button" onClick={() => onRestoreSelection?.()} disabled={!hasMask}>
                <TbBrush /> Unselect Path
            </button>

            <button className="remove-background-button" type="button" onClick={onRemoveBackground} disabled={!hasMask || backgroundRemoved}>
                Remove Background
            </button>

            <div className="action-grid">
                <button type="button" onClick={onUndo} disabled={!canUndo}><FiRotateCcw /> Undo</button>
                <button type="button" onClick={onRedo} disabled={!canRedo}><FiRotateCw /> Redo</button>
            </div>

            <button className="soft-action" type="button" onClick={() => onStartOver?.()} disabled={isDetecting || !onStartOver}>
                <FiRotateCcw /> Start Over
            </button>

            <strong className="field-heading">Zoom & Pan</strong>
            <div className="zoom-controls">
                <button type="button" onClick={() => setZoom(Math.max(0.35, Number((zoom - 0.15).toFixed(2))))}><FiMinus /></button>
                <span>{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => setZoom(Math.min(3, Number((zoom + 0.15).toFixed(2))))}><FiPlus /></button>
                <button
                    className={panMode ? 'active-tool' : ''}
                    type="button"
                    aria-label="Pan image"
                    disabled={zoom <= 1}
                    onClick={() => setPanMode((value) => !value)}
                    title={zoom <= 1 ? 'Zoom in before panning' : 'Pan image'}
                >
                    <FiMove />
                </button>
            </div>

            {status && <p className="editor-status">{status}</p>}
        </section>
    );
}

function CanvasEditor({
    imageUrl,
    imageFile,
    activeBackground,
    backgroundImageUrl,
    editorMode,
    setEditorMode,
    manualTool,
    brushSize,
    hardness,
    zoom,
    panMode,
    setStatus,
    setIsDetecting,
    isDetecting,
    detectProgress,
    setDetectProgress,
    detectStage,
    setDetectStage,
    setHasMask,
    setBackgroundRemoved,
    backgroundRemoved,
    hasMask,
    detectionSource,
    setDetectionSource,
    setPreviewImages,
    registerActions,
}) {
    const canvasRef = useRef(null);
    const imageCanvasRef = useRef(null);
    const originalImageDataRef = useRef(null);
    const originalTrainingBlobRef = useRef(null);
    const originalTrainingNameRef = useRef('');
    const backgroundCanvasRef = useRef(null);
    const maskRef = useRef(null);
    const initialTrainingMaskRef = useRef(null);
    const keepCorrectionRef = useRef(null);
    const removeCorrectionRef = useRef(null);
    const manualCorrectionCountRef = useRef(0);
    const trainingExampleSavedRef = useRef(false);
    const historyRef = useRef([]);
    const redoRef = useRef([]);
    const isPaintingRef = useRef(false);
    const brushSampleRef = useRef({ r: 0, g: 0, b: 0, count: 0, colors: [] });
    const brushPointsRef = useRef([]);
    const brushStartPointRef = useRef(null);
    const brushMovedRef = useRef(false);
    const lastPointRef = useRef(null);
    const panDragRef = useRef(null);
    const manualPathRef = useRef([]);
    const brushPreviewPointRef = useRef(null);
    const editingResultRef = useRef(false);
    const isDrawingPathRef = useRef(false);
    const autoDetectStartedRef = useRef(false);
    const [autoDetectNonce, setAutoDetectNonce] = useState(0);

    const syncPreviews = useCallback(() => {
        const previews = createPreviewImages(imageCanvasRef.current, maskRef.current, activeBackground, backgroundCanvasRef.current);
        if (previews) setPreviewImages(previews);
    }, [activeBackground, setPreviewImages]);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        const imageCanvas = imageCanvasRef.current;
        const mask = maskRef.current;
        if (!canvas || !imageCanvas || !mask) return;

        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (editorMode === 'original') {
            context.drawImage(imageCanvas, 0, 0);
            return;
        }

        if (backgroundRemoved || editorMode === 'result') {
            fillCanvasBackground(context, canvas.width, canvas.height, activeBackground, backgroundCanvasRef.current);
            drawSubject(context, imageCanvas, mask);
            return;
        }

        if (editorMode === 'mask' && editingResultRef.current && manualTool === 'brush') {
            fillCanvasBackground(context, canvas.width, canvas.height, activeBackground, backgroundCanvasRef.current);
            drawSubject(context, imageCanvas, mask);
            drawRemovalEdges(context, mask);
            drawBrushPreview(context, brushPreviewPointRef.current, brushSize, manualTool);
            return;
        }

        context.drawImage(imageCanvas, 0, 0);
        if (editorMode === 'auto') {
            drawMaskOverlay(context, mask);
            drawMaskEdges(context, mask);
        } else if (manualTool === 'brush') {
            drawRemovalOverlay(context, mask);
            drawRemovalEdges(context, mask);
        } else {
            drawMaskOverlay(context, mask);
            drawMaskEdges(context, mask);
        }
        drawManualPath(context, manualPathRef.current);
        if (editorMode === 'mask' && !panMode) {
            drawBrushPreview(context, brushPreviewPointRef.current, brushSize, manualTool);
        }
    }, [activeBackground, backgroundRemoved, brushSize, editorMode, manualTool, panMode]);

    const updateHistoryState = useCallback(() => {
        registerActions((previous) => ({
            ...previous,
            canUndo: historyRef.current.length > 0,
            canRedo: redoRef.current.length > 0,
        }));
    }, [registerActions]);

    const pushHistory = useCallback(() => {
        if (!maskRef.current) return;
        historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), cloneImageData(maskRef.current)];
        redoRef.current = [];
        updateHistoryState();
    }, [updateHistoryState]);

    const setMask = useCallback((mask) => {
        const nextMask = normalizeMask(mask);
        maskRef.current = nextMask;
        setHasMask(!isEmptyMask(nextMask));
        render();
        syncPreviews();
    }, [render, setHasMask, syncPreviews]);

    const saveTrainingExample = useCallback(async () => {
        if (trainingExampleSavedRef.current || manualCorrectionCountRef.current <= 0) return;
        if (!originalTrainingBlobRef.current || !maskRef.current) return;

        const fallbackInitialMask = initialTrainingMaskRef.current || createFullMask(maskRef.current.width, maskRef.current.height, 255);

        try {
            const result = await submitTrainingExample({
                originalBlob: originalTrainingBlobRef.current,
                originalName: originalTrainingNameRef.current,
                initialMask: fallbackInitialMask,
                correctedMask: maskRef.current,
                keepCorrections: keepCorrectionRef.current,
                removeCorrections: removeCorrectionRef.current,
                source: initialTrainingMaskRef.current ? 'auto-detect' : 'manual-only',
                metadata: {
                    manual_corrections: manualCorrectionCountRef.current,
                    width: maskRef.current.width,
                    height: maskRef.current.height,
                    detection_source: detectionSource || null,
                },
            });

            trainingExampleSavedRef.current = true;
            console.info('Compudia training example saved', result?.id);
            setStatus('Background removed. Your correction was saved for future AI learning.');
        } catch (error) {
            console.warn('Could not save training example', error);
        }
    }, [detectionSource, setStatus]);

    const autoDetect = useCallback(async () => {
        if (!imageUrl || !canvasRef.current || isDetecting) return;

        const shouldRefineCurrentResult = (backgroundRemoved || editorMode === 'result') && maskRef.current && !isEmptyMask(maskRef.current);

        setIsDetecting(true);
        setDetectProgress(0);
        setDetectionSource('');
        setDetectStage('Preparing AI detection...');
        setStatus(shouldRefineCurrentResult ? 'Preparing automatic refinement...' : 'Preparing automatic background detection...');

        try {
            let maskBlob = null;
            let usedRembgServer = false;
            let usedLocalDetector = false;
            const sourceImageData = originalImageDataRef.current;
            const imageAspect = sourceImageData
                ? sourceImageData.width / Math.max(1, sourceImageData.height)
                : 1;
            const shouldUseServerAi = imageAspect >= 1.2;

            if (imageFile && shouldUseServerAi) {
                try {
                    setDetectProgress(12);
                    setDetectStage('Uploading image...');
                    setStatus('Uploading image...');
                    maskBlob = await requestRembgBackgroundRemoval(imageFile);
                    usedRembgServer = true;
                    setDetectProgress(82);
                    setDetectStage('AI detection complete...');
                    setStatus('AI detection complete. Preparing mask...');
                } catch (serverError) {
                    console.warn(serverError);
                    setDetectProgress(8);
                    setDetectStage('Using browser fallback...');
                    setStatus('AI service is unavailable. Using browser fallback detection...');
                }
            }

            if (!maskBlob) {
                setDetectProgress(8);
                const updateLocalStage = (stage) => {
                    setDetectStage(stage);
                    setStatus(stage);
                };
                updateLocalStage(shouldUseServerAi ? 'Loading browser fallback...' : 'Loading portrait detector...');
                maskBlob = await runLocalSegmentation(
                    imageUrl,
                    (_key, current, total) => {
                        if (total) {
                            const loadPercent = Math.max(0, Math.min(1, current / total));
                            const percent = Math.min(65, Math.round(8 + (loadPercent * 57)));
                            setDetectProgress(percent);
                            setDetectStage(`Loading local AI... ${percent}%`);
                            setStatus(`Loading local AI... ${percent}%`);
                        }
                    },
                    updateLocalStage,
                );
                usedLocalDetector = true;
            }
            setDetectProgress(80);
            setDetectStage('Building mask...');
            setStatus('Building mask...');
            const rawMask = await blobToImageData(maskBlob, canvasRef.current.width, canvasRef.current.height);
            setDetectProgress(90);
            setDetectStage(usedRembgServer ? 'Applying AI selection...' : 'Refining product edges...');
            setStatus(usedRembgServer ? 'Applying AI selection...' : 'Refining product edges...');
            const detectedMask = usedRembgServer
                ? repairWideContainerSurface(
                    repairLightProductInterior(sharpenMaskEdges(normalizeMask(rawMask)), originalImageDataRef.current),
                    originalImageDataRef.current,
                )
                : refineAutoDetectedMask(rawMask, originalImageDataRef.current);
            const mask = applyManualCorrectionMemory(
                shouldRefineCurrentResult
                    ? mergeMasksForResultRefinement(maskRef.current, detectedMask)
                    : detectedMask,
                keepCorrectionRef.current,
                removeCorrectionRef.current,
            );
            if (isEmptyMask(mask)) {
                throw new Error('Automatic detection returned an empty mask.');
            }
            setDetectProgress(95);
            setDetectStage('Applying selection...');
            setStatus('Applying selection...');
            pushHistory();
            if (!shouldRefineCurrentResult) {
                initialTrainingMaskRef.current = cloneImageData(mask);
                manualCorrectionCountRef.current = 0;
                trainingExampleSavedRef.current = false;
            }
            setMask(mask);
            editingResultRef.current = false;
            setBackgroundRemoved(shouldRefineCurrentResult);
            setDetectionSource(usedRembgServer ? 'rembg' : usedLocalDetector ? 'local' : 'browser');
            setEditorMode(shouldRefineCurrentResult ? 'result' : 'auto');
            setDetectProgress(100);
            setDetectStage('Done');
            setStatus(shouldRefineCurrentResult
                ? 'Current result refined. Use Manual Selection for final small fixes, or download the result.'
                : usedRembgServer
                    ? 'Automatic selection ready. If needed, refine manually, then remove the background.'
                    : shouldUseServerAi
                        ? 'Browser fallback selection ready. Automatic AI service was not used.'
                        : 'Portrait selection ready. If needed, refine manually, then remove the background.');
        } catch (error) {
            console.error(error);
            setStatus('Auto Detect failed. Start the AI service, or use Select Manually.');
        } finally {
            setIsDetecting(false);
            setDetectProgress(0);
            setDetectStage('');
        }
    }, [backgroundRemoved, editorMode, imageFile, imageUrl, isDetecting, pushHistory, setBackgroundRemoved, setDetectProgress, setDetectStage, setDetectionSource, setEditorMode, setIsDetecting, setMask, setStatus]);

    const removeBackground = useCallback(() => {
        if (!maskRef.current || isEmptyMask(maskRef.current)) {
            setStatus('Select the subject first with Auto Detect or Select Manually, then remove the background.');
            return;
        }
        editingResultRef.current = false;
        setBackgroundRemoved(true);
        setEditorMode('result');
        setDetectionSource('');
        setStatus('Background removed. Choose a background or download the result.');
        render();
        saveTrainingExample();
    }, [render, saveTrainingExample, setBackgroundRemoved, setDetectionSource, setEditorMode, setStatus]);

    const startManualSelection = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Preserve an automatic mask when switching to manual refinement
        // before the user renders the result.
        const shouldKeepCurrentSelection = hasMask && maskRef.current && !isEmptyMask(maskRef.current);

        pushHistory();
        editingResultRef.current = shouldKeepCurrentSelection;
        if (!shouldKeepCurrentSelection) {
            maskRef.current = createFullMask(canvas.width, canvas.height, 255);
            setHasMask(false);
        } else {
            setHasMask(true);
        }
        manualPathRef.current = [];
        brushPreviewPointRef.current = null;
        isPaintingRef.current = false;
        isDrawingPathRef.current = false;
        brushSampleRef.current = { r: 0, g: 0, b: 0, count: 0, colors: [] };
        brushPointsRef.current = [];
        brushStartPointRef.current = null;
        brushMovedRef.current = false;
        lastPointRef.current = null;
        panDragRef.current = null;
        setBackgroundRemoved(false);
        setEditorMode('mask');
        setDetectionSource('');
        setStatus(
            shouldKeepCurrentSelection
                ? 'Manual refinement enabled from the current result. Brush over leftover background parts to remove them.'
                : 'Manual selection enabled. Drag over only the background area you want to remove.'
        );
        render();
        syncPreviews();
    }, [hasMask, pushHistory, render, setBackgroundRemoved, setDetectionSource, setEditorMode, setHasMask, setStatus, syncPreviews]);

    const restoreSelection = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (!maskRef.current) {
            maskRef.current = createFullMask(canvas.width, canvas.height, 0);
            setHasMask(false);
        }

        editingResultRef.current = false;
        manualPathRef.current = [];
        brushPreviewPointRef.current = null;
        isPaintingRef.current = false;
        isDrawingPathRef.current = false;
        brushSampleRef.current = { r: 0, g: 0, b: 0, count: 0, colors: [] };
        brushPointsRef.current = [];
        brushStartPointRef.current = null;
        brushMovedRef.current = false;
        lastPointRef.current = null;
        panDragRef.current = null;
        setBackgroundRemoved(false);
        setEditorMode('mask');
        setDetectionSource('');
        setStatus('Unselect Path enabled. Brush over missing object parts to keep them.');
        render();
        syncPreviews();
    }, [render, setBackgroundRemoved, setDetectionSource, setEditorMode, setHasMask, setStatus, syncPreviews]);

    const startOver = useCallback(() => {
        const canvas = canvasRef.current;
        const imageCanvas = imageCanvasRef.current;
        if (!canvas || !imageCanvas) return;

        pushHistory();
        maskRef.current = createFullMask(canvas.width, canvas.height, 255);
        initialTrainingMaskRef.current = null;
        keepCorrectionRef.current = createFullMask(canvas.width, canvas.height, 0);
        removeCorrectionRef.current = createFullMask(canvas.width, canvas.height, 0);
        manualCorrectionCountRef.current = 0;
        trainingExampleSavedRef.current = false;
        manualPathRef.current = [];
        brushPreviewPointRef.current = null;
        editingResultRef.current = false;
        isPaintingRef.current = false;
        isDrawingPathRef.current = false;
        brushSampleRef.current = { r: 0, g: 0, b: 0, count: 0, colors: [] };
        brushPointsRef.current = [];
        brushStartPointRef.current = null;
        brushMovedRef.current = false;
        lastPointRef.current = null;
        panDragRef.current = null;
        setHasMask(false);
        setBackgroundRemoved(false);
        setDetectionSource('');
        setEditorMode('original');
        setStatus('Started over with the original image. Auto Detect or Select Manually when ready.');
        render();
        syncPreviews();
    }, [pushHistory, render, setBackgroundRemoved, setDetectionSource, setEditorMode, setHasMask, setStatus, syncPreviews]);

    const undo = useCallback(() => {
        if (!historyRef.current.length || !maskRef.current) return;
        redoRef.current = [...redoRef.current, cloneImageData(maskRef.current)];
        maskRef.current = historyRef.current[historyRef.current.length - 1];
        historyRef.current = historyRef.current.slice(0, -1);
        setHasMask(!isEmptyMask(maskRef.current));
        setBackgroundRemoved(false);
        setEditorMode('mask');
        updateHistoryState();
        render();
        syncPreviews();
    }, [render, setBackgroundRemoved, setEditorMode, syncPreviews, updateHistoryState]);

    const redo = useCallback(() => {
        if (!redoRef.current.length || !maskRef.current) return;
        historyRef.current = [...historyRef.current, cloneImageData(maskRef.current)];
        maskRef.current = redoRef.current[redoRef.current.length - 1];
        redoRef.current = redoRef.current.slice(0, -1);
        setHasMask(!isEmptyMask(maskRef.current));
        setBackgroundRemoved(false);
        setEditorMode('mask');
        updateHistoryState();
        render();
        syncPreviews();
    }, [render, setBackgroundRemoved, setEditorMode, syncPreviews, updateHistoryState]);

    const download = useCallback(() => {
        const imageCanvas = imageCanvasRef.current;
        const mask = maskRef.current;
        if (!imageCanvas || !mask) return;

        const output = createOutputCanvas(imageCanvas, mask, activeBackground, backgroundCanvasRef.current);

        const link = document.createElement('a');
        link.download = `${imageFile?.name?.replace(/\.[^.]+$/, '') || 'compudia-image'}-background-removed.png`;
        link.href = output.toDataURL('image/png');
        link.click();
        setStatus('Image downloaded successfully.');
    }, [activeBackground, imageFile, setStatus]);

    useEffect(() => {
        registerActions({
            autoDetect,
            startManualSelection,
            restoreSelection,
            startOver,
            removeBackground,
            undo,
            redo,
            download,
            canUndo: historyRef.current.length > 0,
            canRedo: redoRef.current.length > 0,
        });
    }, [autoDetect, download, redo, registerActions, removeBackground, restoreSelection, startManualSelection, startOver, undo]);

    useEffect(() => {
        let cancelled = false;

        async function prepareImage() {
            const image = await loadImage(imageUrl);
            if (cancelled) return;

            const imageCanvas = createCanvas(image.naturalWidth, image.naturalHeight);
            const imageContext = imageCanvas.getContext('2d', { willReadFrequently: true });
            imageContext.drawImage(image, 0, 0);
            imageCanvasRef.current = imageCanvas;
            originalImageDataRef.current = imageContext.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
            originalTrainingBlobRef.current = imageFile || await canvasToBlob(imageCanvas, 'image/png');
            originalTrainingNameRef.current = imageFile?.name || 'original.png';

            const canvas = canvasRef.current;
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            maskRef.current = createFullMask(image.naturalWidth, image.naturalHeight, 255);
            initialTrainingMaskRef.current = null;
            keepCorrectionRef.current = createFullMask(image.naturalWidth, image.naturalHeight, 0);
            removeCorrectionRef.current = createFullMask(image.naturalWidth, image.naturalHeight, 0);
            manualCorrectionCountRef.current = 0;
            trainingExampleSavedRef.current = false;
            manualPathRef.current = [];
            brushPreviewPointRef.current = null;
            editingResultRef.current = false;
            historyRef.current = [];
            redoRef.current = [];
            autoDetectStartedRef.current = false;
            setHasMask(false);
            setBackgroundRemoved(false);
            setEditorMode('original');
            setDetectionSource('');
            setStatus('Original photo loaded. Starting automatic AI detection...');
            updateHistoryState();
            setPreviewImages(createPreviewImages(imageCanvas, maskRef.current, activeBackground, backgroundCanvasRef.current));
            requestAnimationFrame(render);
            setAutoDetectNonce(Date.now());
        }

        prepareImage().catch((error) => {
            console.error(error);
            setStatus('Could not load the image.');
        });

        return () => {
            cancelled = true;
        };
    }, [imageUrl]);

    useEffect(() => {
        if (!autoDetectNonce || autoDetectStartedRef.current) return;

        autoDetectStartedRef.current = true;
        const timer = window.setTimeout(() => {
            autoDetect();
        }, 120);

        return () => window.clearTimeout(timer);
    }, [autoDetect, autoDetectNonce]);

    useEffect(() => {
        let cancelled = false;

        async function prepareBackgroundImage() {
            if (!backgroundImageUrl) {
                backgroundCanvasRef.current = null;
                render();
                syncPreviews();
                return;
            }

            const image = await loadImage(backgroundImageUrl);
            if (cancelled) return;
            const canvas = createCanvas(image.naturalWidth, image.naturalHeight);
            canvas.getContext('2d').drawImage(image, 0, 0);
            backgroundCanvasRef.current = canvas;
            render();
            syncPreviews();
        }

        prepareBackgroundImage().catch((error) => {
            console.error(error);
            backgroundCanvasRef.current = null;
            setStatus('Could not load the background image.');
        });

        return () => {
            cancelled = true;
        };
    }, [backgroundImageUrl, render, syncPreviews, setStatus]);

    useEffect(() => {
        render();
        syncPreviews();
    }, [render, syncPreviews]);

    useEffect(() => {
        if (zoom <= 1 && panMode) {
            setStatus('Pan is available after zooming in above 100%.');
        }
    }, [panMode, setStatus, zoom]);

    const paintAt = (event) => {
        const canvas = canvasRef.current;
        const mask = maskRef.current;
        if (!canvas || !mask || panMode) return;

        const point = getCanvasPoint(event, canvas);
        brushPreviewPointRef.current = point;
        const last = lastPointRef.current || point;
        const distance = Math.hypot(point.x - last.x, point.y - last.y);
        const steps = Math.max(1, Math.ceil(distance / Math.max(2, brushSize / 3)));
        const paintMode = manualTool === 'restore' ? 'keep' : 'remove';

        for (let step = 0; step <= steps; step += 1) {
            const t = step / steps;
            const x = last.x + ((point.x - last.x) * t);
            const y = last.y + ((point.y - last.y) * t);

            brushSampleRef.current = mergeColorSample(
                brushSampleRef.current,
                sampleImageColor(originalImageDataRef.current, x, y),
            );
            brushPointsRef.current = [...brushPointsRef.current, { x, y }].slice(-1200);

            paintMask(
                mask,
                x,
                y,
                brushSize,
                hardness,
                paintMode,
            );

            const keepCorrections = keepCorrectionRef.current;
            const removeCorrections = removeCorrectionRef.current;
            if (keepCorrections && removeCorrections) {
                if (paintMode === 'keep') {
                    paintMask(keepCorrections, x, y, brushSize, hardness, 'keep');
                    paintMask(removeCorrections, x, y, brushSize, hardness, 'remove');
                } else {
                    paintMask(removeCorrections, x, y, brushSize, hardness, 'keep');
                    paintMask(keepCorrections, x, y, brushSize, hardness, 'remove');
                }
            }
        }

        manualCorrectionCountRef.current += 1;
        trainingExampleSavedRef.current = false;
        lastPointRef.current = point;
        setHasMask(!isEmptyMask(mask));
        setBackgroundRemoved(false);
        setEditorMode('mask');
        render();
    };

    return (
        <section className="panel canvas-panel" aria-labelledby="canvas-title">
            <div className="canvas-header">
                <div className="panel-title" id="canvas-title">
                    <FiImage />
                    <span>
                        {editorMode === 'original'
                            ? 'Original Photo'
                            : editorMode === 'result'
                            ? 'Preview Result'
                            : editorMode === 'auto'
                            ? detectionSource === 'browser'
                                ? 'Browser Fallback Detection'
                                : detectionSource === 'local'
                                ? 'Portrait Auto Detection'
                                : 'Auto Detection'
                            : 'Select Manually'}
                    </span>
                </div>
                <span className="zoom-select">{Math.round(zoom * 100)}%</span>
            </div>

            <div
                className="image-stage editor-canvas-stage"
                onContextMenu={(event) => event.preventDefault()}
                onDragStart={(event) => event.preventDefault()}
                onPointerDown={(event) => {
                    event.preventDefault();
                    if (panMode) {
                        brushPreviewPointRef.current = null;
                        render();
                        panDragRef.current = {
                            x: event.clientX,
                            y: event.clientY,
                            left: event.currentTarget.scrollLeft,
                            top: event.currentTarget.scrollTop,
                        };
                        event.currentTarget.setPointerCapture(event.pointerId);
                        return;
                    }

                    if (editorMode !== 'mask') {
                        setStatus('Click Select Manually first to edit the automatic selection.');
                        return;
                    }
                    pushHistory();
                    const point = getCanvasPoint(event, canvasRef.current);
                    brushPreviewPointRef.current = point;
                    if (manualTool === 'pen' && maskRef.current && isFullMask(maskRef.current)) {
                        maskRef.current = createFullMask(maskRef.current.width, maskRef.current.height, 0);
                        setHasMask(false);
                    }
                    if (manualTool === 'brush' && !maskRef.current) {
                        maskRef.current = createFullMask(canvasRef.current.width, canvasRef.current.height, 255);
                    }

                    if (manualTool === 'pen') {
                        isDrawingPathRef.current = true;
                        manualPathRef.current = [point];
                        render();
                    } else {
                        isPaintingRef.current = true;
                        brushSampleRef.current = { r: 0, g: 0, b: 0, count: 0, colors: [] };
                        brushPointsRef.current = [];
                        brushStartPointRef.current = point;
                        brushMovedRef.current = true;
                        paintAt(event);
                        setStatus(manualTool === 'restore'
                            ? 'Brush over missing object parts to keep them.'
                            : 'Drag over the unwanted material. Similar edge-connected background will be removed on release.');
                    }
                    lastPointRef.current = point;
                    event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                    event.preventDefault();
                    if (panMode && panDragRef.current) {
                        brushPreviewPointRef.current = null;
                        event.currentTarget.scrollLeft = panDragRef.current.left - (event.clientX - panDragRef.current.x);
                        event.currentTarget.scrollTop = panDragRef.current.top - (event.clientY - panDragRef.current.y);
                        return;
                    }
                    if (editorMode === 'mask' && !panMode) {
                        brushPreviewPointRef.current = getCanvasPoint(event, canvasRef.current);
                        if (!isDrawingPathRef.current && !isPaintingRef.current) {
                            render();
                        }
                    }
                    if (isDrawingPathRef.current) {
                        const point = getCanvasPoint(event, canvasRef.current);
                        const last = manualPathRef.current[manualPathRef.current.length - 1];
                        if (!last || Math.hypot(point.x - last.x, point.y - last.y) > 3) {
                            manualPathRef.current = [...manualPathRef.current, point];
                            render();
                        }
                        return;
                    }
                    if (isPaintingRef.current) {
                        const point = getCanvasPoint(event, canvasRef.current);
                        const start = brushStartPointRef.current || point;
                        if (brushMovedRef.current || Math.hypot(point.x - start.x, point.y - start.y) >= Math.max(8, brushSize * 0.9)) {
                            brushMovedRef.current = true;
                            paintAt(event);
                        }
                    }
                }}
                onPointerUp={(event) => {
                    event.preventDefault();
                    if (isDrawingPathRef.current && maskRef.current) {
                        const path = manualPathRef.current;
                        if (path.length > 2) {
                            const first = path[0];
                            const last = path[path.length - 1];
                            const closedPath = Math.hypot(first.x - last.x, first.y - last.y) <= MANUAL_PATH_CLOSE_DISTANCE
                                ? path
                                : [...path, first];
                            maskRef.current = fillMaskPath(maskRef.current, closedPath, 'keep');
                            if (keepCorrectionRef.current) {
                                keepCorrectionRef.current = fillMaskPath(keepCorrectionRef.current, closedPath, 'keep');
                            }
                            manualCorrectionCountRef.current += 1;
                            trainingExampleSavedRef.current = false;
                            setHasMask(!isEmptyMask(maskRef.current));
                            setBackgroundRemoved(false);
                            setEditorMode('mask');
                            setStatus('Manual pen selection created. Use Brush Tool to remove unwanted areas, then click Remove Background.');
                        }
                        manualPathRef.current = [];
                        isDrawingPathRef.current = false;
                        render();
                        syncPreviews();
                    }
                    if (isPaintingRef.current && !brushMovedRef.current) {
                        setStatus('Click ignored. Drag the brush over the unwanted area to remove it.');
                    } else if (isPaintingRef.current && maskRef.current) {
                        if (manualTool === 'restore') {
                            setHasMask(!isEmptyMask(maskRef.current));
                            setBackgroundRemoved(false);
                            setEditorMode('mask');
                            setStatus('Restored the brushed object area. Continue brushing or remove the background.');
                            brushSampleRef.current = { r: 0, g: 0, b: 0, count: 0, colors: [] };
                            brushPointsRef.current = [];
                            render();
                            syncPreviews();
                            isPaintingRef.current = false;
                            brushStartPointRef.current = null;
                            brushMovedRef.current = false;
                            lastPointRef.current = null;
                            panDragRef.current = null;
                            updateHistoryState();
                            syncPreviews();
                            event.currentTarget.releasePointerCapture(event.pointerId);
                            return;
                        }
                        const brushedMask = cloneImageData(maskRef.current);
                        const removed = removeSimilarColorComponents(maskRef.current, originalImageDataRef.current, brushSampleRef.current, brushPointsRef.current);
                        const maxSimilarRemoval = Math.floor(maskRef.current.width * maskRef.current.height * 0.12);
                        const removedTooMuch = removed > maxSimilarRemoval;
                        if (removedTooMuch) {
                            maskRef.current = brushedMask;
                        }
                        setHasMask(!isEmptyMask(maskRef.current));
                        setBackgroundRemoved(false);
                        setEditorMode('mask');
                        setStatus(removedTooMuch
                            ? 'Similar selection was too large, so only the brushed stroke was kept. Use a smaller stroke on only the background.'
                            : removed
                            ? 'Removed the brushed area and matching similar background regions.'
                            : 'Removed the brushed stroke. Brush more of the same background if needed.');
                        brushSampleRef.current = { r: 0, g: 0, b: 0, count: 0, colors: [] };
                        brushPointsRef.current = [];
                        render();
                        syncPreviews();
                    }
                    isPaintingRef.current = false;
                    brushStartPointRef.current = null;
                    brushMovedRef.current = false;
                    lastPointRef.current = null;
                    panDragRef.current = null;
                    updateHistoryState();
                    syncPreviews();
                    event.currentTarget.releasePointerCapture(event.pointerId);
                }}
                onPointerCancel={() => {
                    isPaintingRef.current = false;
                    isDrawingPathRef.current = false;
                    brushSampleRef.current = { r: 0, g: 0, b: 0, count: 0, colors: [] };
                    brushPointsRef.current = [];
                    brushStartPointRef.current = null;
                    brushMovedRef.current = false;
                    manualPathRef.current = [];
                    lastPointRef.current = null;
                    panDragRef.current = null;
                    brushPreviewPointRef.current = null;
                    updateHistoryState();
                    render();
                }}
                onPointerLeave={() => {
                    if (isPaintingRef.current || isDrawingPathRef.current || panDragRef.current) return;
                    brushPreviewPointRef.current = null;
                    render();
                }}
            >
                <canvas
                    ref={canvasRef}
                    className={panMode ? 'mask-canvas pan-cursor' : 'mask-canvas brush-cursor'}
                    style={{ width: `${zoom * 100}%` }}
                />
                {isDetecting && (
                    <div className="detect-overlay" role="status" aria-live="polite">
                        <div className="detect-spinner" />
                        <strong>Auto Detecting</strong>
                        <span>{detectStage || 'Preparing model...'}</span>
                        <div className="detect-progress-track" aria-hidden="true">
                            <span style={{ width: `${detectProgress}%` }} />
                        </div>
                        <small>{detectProgress}%</small>
                    </div>
                )}
            </div>
        </section>
    );
}

function PreviewStrip({ imageUrl, previews }) {
    const items = [
        { label: 'Original', src: previews?.original || imageUrl },
        { label: 'Edited Mask', src: previews?.mask || imageUrl },
        { label: 'Output Preview', src: previews?.output || imageUrl, active: true },
        { label: 'Transparent PNG', src: previews?.transparent || imageUrl, checkerboard: true },
    ];

    return (
        <section className="panel preview-panel" aria-labelledby="preview-title">
            <h2 id="preview-title">Original / Preview</h2>
            <div className="preview-list compact-preview-list">
                {items.map((item) => (
                    <figure className={item.active ? 'active' : ''} key={item.label}>
                        <span className={item.checkerboard ? 'checkerboard' : ''}>
                            <img src={item.src} alt={`${item.label} preview`} />
                        </span>
                        <figcaption>{item.label}</figcaption>
                    </figure>
                ))}
            </div>
        </section>
    );
}

function Editor({
    imageUrl,
    imageFile,
    activeBackground,
    setActiveBackground,
    customColor,
    setCustomColor,
    backgroundType,
    setBackgroundType,
    backgroundImageUrl,
    onBackgroundImage,
    onNewImage,
}) {
    const [editorMode, setEditorMode] = useState('original');
    const [manualTool, setManualTool] = useState('brush');
    const [brushSize, setBrushSize] = useState(28);
    const [hardness, setHardness] = useState(80);
    const [zoom, setZoom] = useState(1);
    const [panMode, setPanMode] = useState(false);
    const [status, setStatus] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
    const [detectProgress, setDetectProgress] = useState(0);
    const [detectStage, setDetectStage] = useState('');
    const [detectionSource, setDetectionSource] = useState('');
    const [hasMask, setHasMask] = useState(false);
    const [backgroundRemoved, setBackgroundRemoved] = useState(false);
    const [actions, setActions] = useState({});
    const [previewImages, setPreviewImages] = useState(null);

    useEffect(() => {
        if (zoom <= 1 && panMode) setPanMode(false);
    }, [panMode, zoom]);

    return (
        <>
            <main className="editor-grid">
                <SelectionPanel
                    editorMode={editorMode}
                    setEditorMode={setEditorMode}
                    manualTool={manualTool}
                    setManualTool={setManualTool}
                    brushSize={brushSize}
                    setBrushSize={setBrushSize}
                    hardness={hardness}
                    setHardness={setHardness}
                    zoom={zoom}
                    setZoom={setZoom}
                    panMode={panMode}
                    setPanMode={setPanMode}
                    onSelectManually={() => {
                        setManualTool('brush');
                        if (actions.startManualSelection) {
                            actions.startManualSelection();
                            return;
                        }
                        setEditorMode('mask');
                        setBackgroundRemoved(false);
                        setStatus('Manual brush enabled.');
                    }}
                    canUndo={Boolean(actions.canUndo)}
                    canRedo={Boolean(actions.canRedo)}
                    onUndo={actions.undo}
                    onRedo={actions.redo}
                    onAutoDetect={actions.autoDetect}
                    onRestoreSelection={() => {
                        setManualTool('restore');
                        if (actions.restoreSelection) {
                            actions.restoreSelection();
                            return;
                        }
                        setEditorMode('mask');
                        setBackgroundRemoved(false);
                        setStatus('Unselect Path enabled.');
                    }}
                    onRemoveBackground={actions.removeBackground}
                    onStartOver={actions.startOver}
                    isDetecting={isDetecting}
                    hasMask={hasMask}
                    backgroundRemoved={backgroundRemoved}
                    status={status}
                />

                <CanvasEditor
                    imageUrl={imageUrl}
                    imageFile={imageFile}
                    activeBackground={activeBackground}
                    backgroundImageUrl={backgroundImageUrl}
                    editorMode={editorMode}
                    setEditorMode={setEditorMode}
                    manualTool={manualTool}
                    brushSize={brushSize}
                    hardness={hardness}
                    zoom={zoom}
                    panMode={panMode}
                    setStatus={setStatus}
                    setIsDetecting={setIsDetecting}
                    isDetecting={isDetecting}
                    detectProgress={detectProgress}
                    setDetectProgress={setDetectProgress}
                    detectStage={detectStage}
                    setDetectStage={setDetectStage}
                    setHasMask={setHasMask}
                    setBackgroundRemoved={setBackgroundRemoved}
                    backgroundRemoved={backgroundRemoved}
                    hasMask={hasMask}
                    detectionSource={detectionSource}
                    setDetectionSource={setDetectionSource}
                    setPreviewImages={setPreviewImages}
                    registerActions={setActions}
                />

                <div className="editor-side">
                    <BackgroundOptions
                        activeBackground={activeBackground}
                        setActiveBackground={setActiveBackground}
                        customColor={customColor}
                        setCustomColor={setCustomColor}
                        backgroundType={backgroundType}
                        setBackgroundType={setBackgroundType}
                        backgroundImageUrl={backgroundImageUrl}
                        onBackgroundImage={onBackgroundImage}
                    />

                    <button className="download-button" type="button" onClick={actions.download} disabled={!hasMask}>
                        <FiDownload />
                        Download Image
                    </button>
                    <small className="export-note">PNG export uses the edited mask at original image resolution.</small>
                    <button className="ghost-button" type="button" onClick={onNewImage}>Upload New Image</button>
                </div>
            </main>

            <PreviewStrip imageUrl={imageUrl} previews={previewImages} />
        </>
    );
}

export default function Home() {
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [activeBackground, setActiveBackground] = useState('#ffffff');
    const [customColor, setCustomColor] = useState('#ffffff');
    const [backgroundType, setBackgroundType] = useState('color');
    const [backgroundImageUrl, setBackgroundImageUrl] = useState('');

    const handleImage = (file) => {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        setImageFile(file);
        setImageUrl(URL.createObjectURL(file));
    };

    const handleBackgroundImage = (file) => {
        if (backgroundImageUrl) URL.revokeObjectURL(backgroundImageUrl);
        setBackgroundImageUrl(URL.createObjectURL(file));
        setBackgroundType('image');
        setActiveBackground('image');
    };

    const resetImage = () => {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        setImageFile(null);
        setImageUrl('');
        setActiveBackground('#ffffff');
        setCustomColor('#ffffff');
        setBackgroundType('color');
    };

    useEffect(() => () => {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
    }, [imageUrl]);

    useEffect(() => () => {
        if (backgroundImageUrl) URL.revokeObjectURL(backgroundImageUrl);
    }, [backgroundImageUrl]);

    const structuredData = useMemo(() => ({
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                name: 'Compudia',
                url: 'https://compudia.com/',
            },
            {
                '@type': 'WebApplication',
                name: 'Compudia Background Remover',
                url: canonicalUrl,
                description: seoDescription,
                applicationCategory: 'MultimediaApplication',
                operatingSystem: 'Web',
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                },
                featureList: [
                    'Remove image background online',
                    'Automatic subject detection',
                    'Manual brush refinement',
                    'Transparent PNG download',
                    'Color and image background options',
                ],
            },
            {
                '@type': 'FAQPage',
                mainEntity: [
                    {
                        '@type': 'Question',
                        name: 'Can I download a transparent background image?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Yes. After removing the original background, choose Transparent and download the result as a PNG.',
                        },
                    },
                    {
                        '@type': 'Question',
                        name: 'Can I manually fix the background removal?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Yes. Compudia includes manual selection and brush refinement tools so you can correct areas that automatic detection misses.',
                        },
                    },
                    {
                        '@type': 'Question',
                        name: 'Can I change the background after removing it?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Yes. You can choose a transparent background, a solid color, a preset background, or upload a background image.',
                        },
                    },
                ],
            },
        ],
    }), []);

    return (
        <>
            <Head title={seoTitle}>
                <meta name="description" content={seoDescription} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={`${seoTitle} | Compudia`} />
                <meta property="og:description" content="Automatically remove an image background and refine the selection manually with brush tools. Create transparent PNGs or choose a new background." />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={socialImage} />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={`${seoTitle} | Compudia`} />
                <meta name="twitter:description" content="Remove image backgrounds online, refine the mask manually, choose a new background, and download the result." />
                <meta name="twitter:image" content={socialImage} />
                <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
            </Head>

            <div className={`app-shell ${imageUrl ? 'editor' : 'upload'}`}>
                <Header />

                <div className="page-glow page-glow-left" />
                <div className="page-glow page-glow-right" />

                {!imageUrl ? (
                    <main className="home-content">
                        <section className="hero">
                            <h1><span>Remove Background</span> from Image Online</h1>
                            <p>Upload your image, remove the background automatically, refine the selection manually, and download a transparent PNG or a new background.</p>
                        </section>

                        <section className="upload-layout">
                            <UploadCard onImage={handleImage} />
                            <BackgroundOptions
                                activeBackground={activeBackground}
                                setActiveBackground={setActiveBackground}
                                customColor={customColor}
                                setCustomColor={setCustomColor}
                                backgroundType={backgroundType}
                                setBackgroundType={setBackgroundType}
                                backgroundImageUrl={backgroundImageUrl}
                                onBackgroundImage={handleBackgroundImage}
                            />
                        </section>

                        <FeatureStrip />
                    </main>
                ) : (
                    <Editor
                        imageUrl={imageUrl}
                        imageFile={imageFile}
                        activeBackground={activeBackground}
                        setActiveBackground={setActiveBackground}
                        customColor={customColor}
                        setCustomColor={setCustomColor}
                        backgroundType={backgroundType}
                        setBackgroundType={setBackgroundType}
                        backgroundImageUrl={backgroundImageUrl}
                        onBackgroundImage={handleBackgroundImage}
                        onNewImage={resetImage}
                    />
                )}

                <SeoContent />

                <footer className="site-footer">
                    <span>© 2026 Compudia. All rights reserved.</span>
                    <nav aria-label="Footer navigation">
                        <a href="/privacy">Privacy</a>
                        <a href="/terms">Terms</a>
                        <a href="/contact">Contact</a>
                    </nav>
                </footer>
            </div>
        </>
    );
}
