const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');
const Handlebars = require('handlebars');
const { chromium } = require('playwright');

function resolveResumePath() {
  const source = process.env.RESUME_SOURCE || process.argv[2] || 'Resume.md';
  return path.isAbsolute(source) ? source : path.join(__dirname, source);
}

function buildHtml(resumePath) {
  const fileContent = fs.readFileSync(resumePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const htmlContent = marked.parse(content);
  const templateData = {
    ...data,
    content: htmlContent,
    sectionTitle: data.sectionTitle || 'Employment History',
    baseHref: `file://${path.join(__dirname, 'src')}/`,
  };

  const templatePath = path.join(__dirname, 'src/template.html');
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSource);
  return template(templateData);
}

async function run() {
  try {
    const resumePath = resolveResumePath();
    if (!fs.existsSync(resumePath)) {
      throw new Error(
        `Resume source not found: ${path.relative(__dirname, resumePath)}. ` +
        'Copy Resume.example.md to Resume.md or pass a Markdown path to npm run build -- <path>.'
      );
    }
    const finalHtml = buildHtml(resumePath);

    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.setContent(finalHtml, { waitUntil: 'networkidle' });
    await page.addStyleTag({ path: path.join(__dirname, 'src/style.css') });
    await page.evaluate(() => {
      const pageEl = document.querySelector('.page');
      const contentEl = document.querySelector('.content');
      const sidebarEl = document.querySelector('.sidebar');
      if (!pageEl || !contentEl) return;

      const pageTop = pageEl.getBoundingClientRect().top;
      const contentBottom = contentEl.getBoundingClientRect().bottom - pageTop;
      const sidebarBottom = sidebarEl ? sidebarEl.getBoundingClientRect().bottom - pageTop : 0;
      const targetHeight = Math.max(822.05, contentBottom + 32, sidebarBottom);
      pageEl.style.height = `${targetHeight}px`;
    });

    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir);
    }

    await page.pdf({
      path: 'dist/resume.pdf',
      width: '595.28px',
      height: '822.05px',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();
    console.log(`PDF generated at dist/resume.pdf from ${path.relative(__dirname, resumePath)}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}

module.exports = { buildHtml };
