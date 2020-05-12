let fs = require('fs');

module.exports.htmlCreater = (async function () {

  let data = await require('./electronics.json');
  let createRow = (item) => `
  <tr>
    <td>${item.Name}</td>
    <td>${item.DiscountedPrice}</td>
    <td>${item.OriginalPrice}</td>
  </tr>
`;

  let createTable = (rows) => `
  <table>
    <tr>
        <th>Name</td>
        <th>Discounted Price</td>
        <th>Original Price</td>
    </tr>
    ${rows}
  </table>
`;

  let createHtml = (table) => `
  <html>
    <head>
      <style>
        table {
          width: 100%;
        }
        tr {
          text-align: left;
          border: 1px solid black;
        }
        th, td {
          padding: 15px;
        }
        th{
          background: #94D7E1
        }
        tr:nth-child(3n+1) {
          background: #FEEFE0
        }
        tr:nth-child(3n+2) {
            background: #FFF
          }
        tr:nth-child(3n+3) {
          background: #DFF8E4
        }
        .no-content {
          background-color: red;
        }
      </style>
    </head>
    <body>
      ${table}
    </body>
  </html>
`;

  /* generate rows */
  let rows = data.map(createRow).join(''); // join because i need data in one element
  /* generate table */
  let table = createTable(rows);
  /* generate html */
  let html = createHtml(table);
  /* write the generated html to file */
  await fs.writeFileSync("build.html", html);
});