 // Variabel untuk menyimpan objek stream kamera
      let cameraStream = null;

      // Variabel untuk menyimpan foto yang diambil
      const photos = [];

      // Elemen DOM
      const cameraVideo = document.getElementById("cameraVideo");
      const cameraPlaceholder = document.querySelector(".camera-placeholder");
      const toggleCameraBtn = document.getElementById("toggleCamera");
      const takePhotoBtn = document.getElementById("takePhoto");
      const downloadBtn = document.getElementById("downloadPhotos");
      const popupDownloadBtn = document.getElementById("popupDownload");
      const countdown = document.getElementById("countdown");
      const flash = document.querySelector(".flash");
      const gallerySection = document.querySelector(".gallery-section");
      const galleryEmpty = document.querySelector(
        ".gallery-section .gallery-empty"
      );
      const showGalleryBtn = document.getElementById("showGallery");
      const galleryPopup = document.querySelector(".gallery-popup");
      const closePopupBtn = document.querySelector(".close-popup");
      const popupPhotos = document.querySelector(".popup-photos");
      const popupGalleryEmpty = document.querySelector(
        ".popup-photos .gallery-empty"
      );

      // Fungsi untuk mengaktifkan/mematikan kamera
      toggleCameraBtn.addEventListener("click", async () => {
        if (cameraStream) {
          // Matikan kamera
          cameraStream.getTracks().forEach((track) => track.stop());
          cameraStream = null;
          cameraVideo.style.display = "none";
          cameraPlaceholder.style.display = "flex";
          toggleCameraBtn.textContent = "Nyalakan Kamera";
          takePhotoBtn.disabled = true;
        } else {
          try {
            // Nyalakan kamera
            const constraints = {
              video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: "user",
              },
            };

            cameraStream = await navigator.mediaDevices.getUserMedia(
              constraints
            );
            cameraVideo.srcObject = cameraStream;
            cameraVideo.style.display = "block";
            cameraPlaceholder.style.display = "none";
            toggleCameraBtn.textContent = "Matikan Kamera";
            takePhotoBtn.disabled = false;
          } catch (err) {
            console.error("Error saat mengakses kamera:", err);
            alert(
              "Tidak dapat mengakses kamera. Pastikan kamera diizinkan dan diaktifkan."
            );
          }
        }
      });

      // Fungsi untuk ambil foto dengan countdown
      takePhotoBtn.addEventListener("click", () => {
        if (!cameraStream) return;

        // Tampilkan countdown
        countdown.style.display = "block";
        countdown.textContent = "2";

        // Mulai hitungan mundur
        let seconds = 2;
        const timer = setInterval(() => {
          seconds--;
          if (seconds <= 0) {
            clearInterval(timer);
            countdown.style.display = "none";
            capturePhoto();
          } else {
            countdown.textContent = seconds.toString();
          }
        }, 1000);
      });

      // Fungsi untuk mengambil gambar dari stream kamera
      function capturePhoto() {
        // Efek flash
        flash.style.opacity = "1";
        setTimeout(() => {
          flash.style.opacity = "0";
        }, 200);

        // Buat canvas untuk mengambil gambar
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        // Sesuaikan ukuran canvas dengan video
        canvas.width = cameraVideo.videoWidth;
        canvas.height = cameraVideo.videoHeight;

        // Gambar video ke canvas (dengan flip horizontal untuk menyesuaikan selfie)
        context.scale(-1, 1);
        context.drawImage(
          cameraVideo,
          -canvas.width,
          0,
          canvas.width,
          canvas.height
        );

        // Ubah canvas menjadi URL data
        const imageDataURL = canvas.toDataURL("image/png");

        // Simpan foto
        photos.push(imageDataURL);

        // Tampilkan di galeri
        updateGallery();

        // Aktifkan tombol download
        downloadBtn.disabled = false;
        popupDownloadBtn.disabled = false;
      }

      // Fungsi untuk memperbarui tampilan galeri
      function updateGallery() {
        // Update galeri desktop
        if (photos.length > 0) {
          gallerySection.innerHTML = "";
          galleryEmpty.style.display = "none";

          photos.forEach((photo, index) => {
            const photoContainer = document.createElement("div");
            photoContainer.classList.add("photo-container");
            photoContainer.style.animationDelay = `${index * 0.1}s`;

            const img = document.createElement("img");
            img.src = photo;
            img.alt = `Foto ${index + 1}`;

            photoContainer.appendChild(img);
            gallerySection.appendChild(photoContainer);
          });

          // Tambahkan efek hover
          gallerySection.classList.add("hover-effect");
        } else {
          gallerySection.innerHTML = "";
          gallerySection.appendChild(galleryEmpty);
          gallerySection.classList.remove("hover-effect");
        }

        // Update galeri popup
        if (photos.length > 0) {
          popupPhotos.innerHTML = "";

          photos.forEach((photo, index) => {
            const photoContainer = document.createElement("div");
            photoContainer.classList.add("photo-container");

            const img = document.createElement("img");
            img.src = photo;
            img.alt = `Foto ${index + 1}`;

            photoContainer.appendChild(img);
            popupPhotos.appendChild(photoContainer);
          });
        } else {
          popupPhotos.innerHTML =
            '<div class="gallery-empty">Belum ada foto yang diambil</div>';
        }
      }

      // Fungsi untuk mendownload foto
      downloadBtn.addEventListener("click", downloadPhotos);
      popupDownloadBtn.addEventListener("click", downloadPhotos);

      function downloadPhotos() {
        if (photos.length === 0) return;

        if (photos.length === 1) {
          // Download single photo
          const link = document.createElement("a");
          link.href = photos[0];
          link.download = `romantic-photobooth-${Date.now()}.png`;
          link.click();
        } else {
          // Create ZIP archive for multiple photos
          const zip = new JSZip();
          const folder = zip.folder("romantic-photobooth");

          // Add photos to ZIP
          photos.forEach((photo, index) => {
            // Convert base64 to binary
            const imageData = photo.replace("data:image/png;base64,", "");
            folder.file(`photo-${index + 1}.png`, imageData, { base64: true });
          });

          // Generate and download ZIP
          zip.generateAsync({ type: "blob" }).then(function (content) {
            saveAs(content, `romantic-photobooth-${Date.now()}.zip`);
          });
        }
      }

      // Handle popup gallery
      showGalleryBtn.addEventListener("click", () => {
        galleryPopup.classList.add("active");
      });

      closePopupBtn.addEventListener("click", () => {
        galleryPopup.classList.remove("active");
      });

      // Close popup when clicking outside
      galleryPopup.addEventListener("click", (e) => {
        if (e.target === galleryPopup) {
          galleryPopup.classList.remove("active");
        }
      });

      // Generate floating hearts for background decoration
      function createHearts() {
        const heartsContainer = document.querySelector(".hearts-container");
        const numberOfHearts = 10;

        for (let i = 0; i < numberOfHearts; i++) {
          const heart = document.createElement("div");
          heart.classList.add("heart");

          // Random position
          heart.style.left = `${Math.random() * 100}%`;
          heart.style.top = `${Math.random() * 100}%`;

          // Random size
          const size = 15 + Math.random() * 30;
          heart.style.width = `${size}px`;
          heart.style.height = `${size}px`;

          // Random opacity
          heart.style.opacity = 0.1 + Math.random() * 0.3;

          heartsContainer.appendChild(heart);

          // Add floating animation
          heart.style.animation = `floating ${
            5 + Math.random() * 10
          }s ease-in-out infinite`;
          heart.style.animationDelay = `${Math.random() * 5}s`;
        }
      }

      // Add floating animation
      document.head.insertAdjacentHTML(
        "beforeend",
        `
            <style>
                @keyframes floating {
                    0% { transform: rotate(-45deg) translate(0, 0); }
                    50% { transform: rotate(-45deg) translate(0, -15px); }
                    100% { transform: rotate(-45deg) translate(0, 0); }
                }
            </style>
        `
      );

      // Call on page load
      window.addEventListener("load", createHearts);