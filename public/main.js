var qty = document.getElementsByClassName("qty");
var trash = document.getElementsByClassName("fa-trash");

Array.from(qty).forEach(function(element) {
      element.addEventListener('click', function(){
        const id = this.parentNode.parentNode.childNodes[7].innerText
        let qty = 1
        if(element.classList.contains('fa-minus-square')){
          qty = -1;
        }

        console.log(qty)
        fetch('cart', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'id': id,
            'qty': qty,
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});



Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        console.log(this.parentNode.parentNode.childNodes[7].innerText)
        const id = this.parentNode.parentNode.childNodes[7].innerText


        fetch('cart', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
           "id": id,
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});
