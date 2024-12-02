let initialData = [];
let remainingData = [];
const aiContainer = document.getElementById("card_container");
const defaultAiImage = "https://shorturl.at/inP3K";
let isAscending = false;

document.getElementById("show_more_btn").addEventListener("click", () => {
  toogleElement(false, "show_more_btn_container");
  toogleElement(true, "remaining_spinner");
  toogleElement(true, "sort_by_date_btn_container");
  sortBtnIconToggle();

  setTimeout(() => {
    displayAllData(remainingData);
  }, 1000);
  setTimeout(() => {
    toogleElement(false, "remaining_spinner");
  }, 1000);
});

const sortBtnIconToggle = () => {
  const sortBtn = document.getElementById("sort_by_date_btn");
  sortBtn.innerHTML = `
    <span>
      <i class="fa-solid fa-arrow-turn-${isAscending ? "up" : "down"}"></i>
    </span> Sort By Date
  `;
};

const clearWithAnimation = (container, sortCondition, callback) => {
  container.classList.add(`${sortCondition ? "fade-out" : "fade-in"}`);
  setTimeout(() => {
    container.innerHTML = "";
    container.classList.remove(`${sortCondition ? "fade-out" : "fade-in"}`);
    callback();
  }, 500);
};

document
  .getElementById("sort_by_date_btn_container")
  .addEventListener("click", () => {
    toogleElement(true, "initial_spinner");
    // aiContainer.innerHTML = "";

    setTimeout(() => {
      isAscending = !isAscending;
      sortBtnIconToggle();
      toogleElement(false, "initial_spinner");
      const sortedData = [...initialData, ...remainingData].sort((a, b) => {
        const dateA = new Date(a.published_in);
        const dateB = new Date(b.published_in);
        return isAscending ? dateA - dateB : dateB - dateA;
      });
      clearWithAnimation(aiContainer, isAscending, () =>
        displayAllData(sortedData)
      );
    }, 500);
  });

const loadAllData = async () => {
  try {
    toogleElement(true, "initial_spinner");
    const url = `https://openapi.programming-hero.com/api/ai/tools`;
    const res = await fetch(url);
    const data = await res.json();
    // console.log(data.data.tools);
    const allData = data.data.tools;
    initialData = allData.slice(0, 6);
    remainingData = allData.slice(6);
    displayAllData(initialData);
    toogleElement(true, "show_more_btn_container");
  } catch (err) {
    console.log(err);
  } finally {
    toogleElement(false, "initial_spinner");
  }
};

const displayAllData = (ais) => {
  ais.forEach((ai, index) => {
    const card = document.createElement("div");
    card.classList.add("card", "shadow-xl", "bg-gray-900");
    card.innerHTML = `
        <div
          class="hidden spinner absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10"
          id="spinner-${index}">
          <div class="border-4 border-blue-500 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
        </div>

        <figure class="image-container tooltip rounded-t-2xl" data-tip="${
          ai?.name
        }">
            <img
                class="card-image transition-transform duration-300 ease-in-out transform hover:scale-110"
                title="${ai?.name}"
                src="${ai?.image || defaultAiImage}"
                alt='${ai?.name + " image"}'
                onerror="this.onerror=null; this.src='${defaultAiImage}';"
            />
        </figure>
        <div class="card-body">
            <p class="text-lg"><strong>Features</strong></p>
            <ol style="list-style: decimal; padding-left: 20px;">
              ${dataList(ai?.features)}
            </ol>
            <hr class="mt-6 mb-2 border border-gray-700" />
            <h1 class="text-xl font-medium">${ai?.name}</h1>
            <p class="text-sm">
                <i class="fa-regular fa-calendar-days"></i>
                <span class="ml-1">${ai?.published_in}</span>
            </p>
        </div>
    `;

    card.addEventListener("click", () => {
      toogleElement(true, `spinner-${index}`);

      setTimeout(() => {
        toogleElement(false, `spinner-${index}`);

        loadSingleCard(ai?.id, defaultAiImage);
      }, 1000);
    });

    aiContainer.appendChild(card);
  });
};

const loadSingleCard = async (id, defaultAiImage) => {
  try {
    const url = `https://openapi.programming-hero.com/api/ai/tool/${id}`;
    const res = await fetch(url);
    const data = await res.json();
    handledModal(data.data, defaultAiImage);
  } catch (err) {
    console.log(err);
  }
};

const handledModal = (data, defaultAiImage) => {
  const modalBox = document.getElementById("show_details_modal_container");
  modalBox.innerHTML = `
    <div class="bg-[#fef6f6] border-2 border-rose-600 rounded-lg p-5">
      <p class="text-black text-lg font-medium">${data?.description || ""}</p>
      <div class="grid grid-cols-3 gap-1 my-3">
        ${productPricing(data?.pricing || [])}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h1 class="text-black text-xl font-medium">Features</h1>
          <ul style="list-style: disc; padding-left: 20px;" class="text-black mt-2 text-sm">
            ${dataList(data?.features || [], true)}
          </ul>
        </div>

        <div>
          <h1 class="text-black text-xl font-medium">Integrations</h1>
          <ul style="list-style: disc; padding-left: 20px;" class="text-black mt-2 text-sm">
            ${dataList(data?.integrations || [])}
          </ul>
        </div>
      </div>
      
    </div>

    <div class="bg-gray-100 border border-gray-600 rounded-lg p-5">
      <div class="relative">
        <span class='absolute py-2 px-4 bg-[#EB5757] text-white rounded-lg top-2.5 right-2.5 font-medium ${
          !data?.accuracy?.score ? "hidden" : "inline-block"
        }'>
          ${data?.accuracy?.score && data?.accuracy?.score * 100}% accuracy
        </span>
        <img class="w-full h-full rounded-lg" src="${data?.image_link[0]}
          "onerror="this.onerror = null; this.src='${defaultAiImage}'" />
      </div>
      <div>
        <h1 class="text-xl font-medium mt-5 text-black">
          ${
            data?.input_output_examples
              ? data?.input_output_examples[0]?.input
              : ""
          }
        </h1>
        <p class="text-gray-500 text-sm">
          ${
            data?.input_output_examples
              ? data?.input_output_examples[0]?.output
              : ""
          }
        </p>
      </div>
    </div>
  `;
  // console.log(data);
  ai_details_modal.showModal();
};

loadAllData();

// Utils File/function are here--------------------

function toogleElement(isShow, elementId) {
  const element = document.getElementById(elementId);
  if (isShow) {
    element.classList.remove("hidden");
  } else {
    element.classList.add("hidden");
  }
}

function lazyLoad(fn, duration) {
  setTimeout(() => {
    fn;
  }, duration);
}

function productPricing(priceArr = []) {
  if (!priceArr || priceArr.length === 0) {
    return `<div class="text-center text-gray-500 col-span-3">No pricing information available</div>`;
  }
  return priceArr
    .map((priceBox, index) => {
      const priceText = priceBox.price;
      const plan = priceBox.plan;
      return `
    <div class="p-2 text-center text-sm font-medium rounded-lg bg-white text-${
      index === 0
        ? "green"
        : index === 1
        ? "orange"
        : index === 2
        ? "rose"
        : "purple"
    }-500">
      <h1>${priceText}</h1>
      <hr class="my-2" />
      <p>${plan}</p>
    </div>`;
    })
    .join("");
}

function dataList(features, isNested) {
  if (!features || Object.keys(features).length === 0) {
    return `<li>No features available</li>`;
  }

  if (Array.isArray(features)) {
    // If features is an array, iterate directly
    return features
      .map((feature) => `<li>${feature || "Unnamed feature"}</li>`)
      .join("");
  }

  // If features is an object, iterate over its entries
  return Object.entries(features)
    .map(([key, value]) => {
      const featureName = isNested ? value?.feature_name : value;
      return `<li>${featureName || "Unnamed feature"}</li>`;
    })
    .join("");
}
