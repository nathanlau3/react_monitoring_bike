import Swal from 'sweetalert2'

export const SweetAlert2 = (res) => {
    if (res.status) {
        return (
            Swal.fire({
                position: "center",
                icon: "success",
                title: res.message,
                showConfirmButton: false,
                timer: 1500
            })
        )
    } else {
        return (
            Swal.fire({
                position: "center",
                icon: "error",
                title: res.message,
                showConfirmButton: false,
                timer: 1500
            })
        )
    }
}

