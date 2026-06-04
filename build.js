const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');
const Handlebars = require('handlebars');

(async () => {
  try {
    // Read the Markdown file
    const resumePath = path.join(__dirname, 'data/Resume.md');
    const fileContent = fs.readFileSync(resumePath, 'utf-8');
    
    // Parse Frontmatter and Markdown
    const { data, content } = matter(fileContent);
    
    // Convert Markdown to HTML
    const htmlContent = marked.parse(content);
    
    // Prepare template data
    const templateData = {
      ...data,
      content: htmlContent
    };
    
    // Read the template file
    const templatePath = path.join(__dirname, 'src/template.html');
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    
    // Compile template with Handlebars
    const template = Handlebars.compile(templateSource);
    const finalHtml = template(templateData);
    
    // Launch browser
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Set content directly
    await page.setContent(finalHtml, { waitUntil: 'networkidle' });
    
    // Add CSS
    await page.addStyleTag({ path: path.join(__dirname, 'src/style.css') });
    
    // Ensure dist directory exists
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir);
    }

    // Print to PDF
    await page.pdf({
      path: 'dist/resume.pdf',
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });
    
    await browser.close();
    console.log('PDF generated at dist/resume.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
})();
