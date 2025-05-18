const wrapBody = (body: string) => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css" />
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
        }
        .markdown-body {
          max-width: 800px;
          padding: 20px;
          margin: auto;
        }
      </style>
    </head>
    <body>
      <article class="markdown-body">
        ${body}
      </article>
    </body>
  </html>`;
};

export { wrapBody };
