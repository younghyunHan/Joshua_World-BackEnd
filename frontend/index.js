document.getElementById(
  'app'
).innerHTML = `<a onClick="showList()">리스트로 이동</a>`;

const showList = () => {
  const url = 'http://localhost:3000/api/list';
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('app').innerHTML = `
      <table>
        <tr>
          <td>
            No
          </td>
          <td>
            Writer
          </td>
          <td>
            Title
          </td>
        </tr>
        <tr>
          <td>${data[0]['id']}</td>
          <td>${data[0]['writer']}</td>
          <td>${data[0]['title']}</td>
        </tr>
      </table>
      `;
    })
    .catch((error) => console.log('error:', error));
};
