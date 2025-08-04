<template>
  <div class="bg-backgroundMain min-h-screen">
    <!-- Баннер -->
    <section class="relative w-full min-h-[500px] flex items-end justify-center overflow-hidden mb-12">
      <GoogleDriveImage
        :src="tour?.image_url || defaultImage"
        :alt="tour?.title"
        class="absolute inset-0 w-full h-full object-cover object-center z-0"
        draggable="false"
      />
      <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/90 to-transparent z-10"></div>
      <div class="relative z-20 pb-12 flex flex-col items-center w-full">
        <h1 class="text-white text-3xl md:text-[56px] md:leading-[68px] font-montserrat font-bold text-center max-w-3xl px-4">
          {{ tour?.title || 'Загрузка...' }}
        </h1>
        <button
          @click.stop="openBookingForm"
          :disabled="loading || !tour?.id"
          class="bg-white/30 border border-white rounded-full text-white text-[22px] font-montserrat font-normal px-[30px] py-[15px] transition-colors duration-200 hover:bg-white/50 tracking-wide mx-auto mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Загрузка...' : 'ЗАБРОНИРОВАТЬ МЕСТО' }}
        </button>
      </div>
    </section>

    <!-- Фильтры/Теги -->
    <section class="px-4 md:px-[100px] mb-16">
      <div class="flex items-center gap-3 justify-center flex-wrap">
        <!-- Loading State для информации -->
        <div v-if="detailsLoading" class="text-center py-8">
          <div class="text-orange-400 text-xl font-montserrat">Загрузка информации...</div>
        </div>

        <!-- Error State для информации -->
        <div v-else-if="detailsError" class="text-center py-8">
          <div class="text-red-500 text-xl font-montserrat">Ошибка загрузки информации</div>
          <div class="text-red-400 text-sm mt-2">{{ detailsError }}</div>
        </div>

        <!-- Информационные кнопки -->
        <div v-else-if="tourInfo && tourInfo.length > 0" class="flex flex-wrap gap-4 justify-center">
          <button 
            v-for="(info, idx) in tourInfo"
            :key="info.id"
            @click="tourInfoOpenedPopup = idx"
            :class="[
              'flex items-center rounded-full px-[30px] py-[15px] font-montserrat font-semibold text-[22px] border border-orange-400 transition-colors duration-200 group relative',
              idx === tourInfoOpenedPopup ? 'bg-orange-400 text-white' : 'bg-white text-orange-400',
              'hover:bg-orange-400 hover:text-white'
            ]"
            style="outline: none;"
          >
            <!-- Админ кнопки внутри основной кнопки -->
            <div v-if="isAdmin" class="flex gap-1 mr-2">
              <button
                @click.stop="openEditTourInfoPopup(info)"
                class="bg-blue-500 hover:bg-blue-600 text-white w-[36px] h-[36px] rounded-full transition-colors duration-200 flex items-center justify-center shadow-lg"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button
                @click.stop="confirmDeleteTourInfo(info)"
                class="bg-red-500 hover:bg-red-600 text-white w-[36px] h-[36px] rounded-full transition-colors duration-200 flex items-center justify-center shadow-lg"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
            
            {{ info.title }}
            <svg
              class="ml-[10px] w-7 h-7 transition-colors duration-200 group-hover:fill-white"
              :fill="idx === tourInfoOpenedPopup ? '#fff' : '#f59e42'"
              viewBox="0 0 28 29"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M27.4989 4.07572C27.5407 2.69564 26.4558 1.54297 25.0757 1.50115L2.58605 0.819642C1.20597 0.777822 0.0532921 1.86269 0.0114715 3.24277C-0.030349 4.62285 1.05452 5.77553 2.4346 5.81735L22.4254 6.42313L21.8196 26.414C21.7778 27.794 22.8627 28.9467 24.2428 28.9885C25.6228 29.0303 26.7755 27.9455 26.8173 26.5654L27.4989 4.07572ZM8 20L9.71341 21.8205L26.7134 5.8205L25 4L23.2866 2.1795L6.28659 18.1795L8 20Z"/>
            </svg>
          </button>
          
          <!-- Кнопка добавления информации для администраторов -->
          <button 
            v-if="isAdmin"
            @click="openAddTourInfoPopup"
            class="inline-flex items-center justify-center px-[30px] py-[15px] bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </button>
        </div>

        <!-- No Data State для информации -->
        <div v-else class="text-center py-8">
          <div class="text-orange-400 text-xl font-montserrat mb-4">Нет доступной информации</div>
          
          <!-- Кнопка добавления информации для администраторов -->
          <button 
            v-if="isAdmin"
            @click="openAddTourInfoPopup"
            class="inline-flex items-center justify-center px-[30px] py-[15px] bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </button>
        </div>

        <!-- Попап с информацией -->
        <tourInfoPopup
          v-if="tourInfoOpenedPopup !== null && tourInfo && tourInfo[tourInfoOpenedPopup]"
          :title="tourInfo[tourInfoOpenedPopup].title"
          :text="tourInfo[tourInfoOpenedPopup].description"
          :image="tourInfo[tourInfoOpenedPopup].image_url"
          @close="tourInfoOpenedPopup = null"
        />
      </div>
    </section>

    <!-- Основной контент -->
    <section class="px-4 md:px-[100px] mb-16">
      <div class="grid grid-cols-1 gap-12 max-w-[1290px] mx-auto">
        <!-- Блок 'О ТУРЕ' -->
        <div class="flex flex-col lg:flex-row items-stretch gap-[30px]">
          <div class="flex-1 flex flex-col">
            <h2 class="font-alice font-normal text-[36px] text-orange-400 mb-6 uppercase flex items-center gap-3">
              🪐 О ТУРЕ
              <!-- Кнопка редактирования для администраторов -->
              <button 
                v-if="isAdmin"
                @click="openEditTourDetailsPopup('about')"
                class="bg-blue-500 hover:bg-blue-600 text-white w-[36px] h-[36px] rounded-full transition-colors duration-200 flex items-center justify-center shadow-lg"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
            </h2>
            <FormattedText 
              :html="tourDetails?.about_tour || tour?.description || 'Духовное паломничество по храмам Наваграха — это особый тур для очищения, получения высшей поддержки и трансформации судьбы. Индия — это место, где исполняются желания и происходят чудесные изменения в жизни.'"
              text-class="text-gray-700 font-montserrat font-normal text-[23px] md:text-[35px] leading-[1.2] mb-8"
            />
          </div>
          <div class="w-full min-h-[333px] h-full max-w-full lg:max-w-[555px] relative">
            <!-- Кнопка редактирования изображения для администраторов -->
            <button 
              v-if="isAdmin"
              @click="openEditImagePopup('about')"
              class="absolute top-4 left-4 z-30 bg-blue-500 hover:bg-blue-600 text-white w-[36px] h-[36px] rounded-full transition-colors duration-200 flex items-center justify-center shadow-lg"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            
            <GoogleDriveImage
              v-if="tourDetails?.about_tour_img"
              :src="tourDetails.about_tour_img"
              alt="О туре"
              class="w-full h-full object-cover rounded-[60px]"
              style="box-shadow: 8px 8px 0 0 #FF9500;"
            />
            <div
              v-if="!tourDetails?.about_tour_img"
              class="w-full h-full bg-gray-200 rounded-[60px] flex items-center justify-center"
              style="box-shadow: 8px 8px 0 0 #FF9500;"
            >
              <span class="text-gray-500 font-montserrat text-[18px]">Картинка</span>
            </div>
          </div>
        </div>

        <!-- Блок 'ПОЧЕМУ ЭТО ОСОБЕННЫЙ ТУР?' -->
        <div class="flex flex-col lg:flex-row items-stretch gap-[30px] mb-[100px]">
          <div class="w-full min-h-[333px] h-full max-w-full lg:max-w-[555px] order-1 lg:order-none mb-6 lg:mb-0 relative">
            <!-- Кнопка редактирования изображения для администраторов -->
            <button 
              v-if="isAdmin"
              @click="openEditImagePopup('special')"
              class="absolute top-4 left-4 z-30 bg-blue-500 hover:bg-blue-600 text-white w-[36px] h-[36px] rounded-full transition-colors duration-200 flex items-center justify-center shadow-lg"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            
            <GoogleDriveImage
              v-if="tourDetails?.why_special_img"
              :src="tourDetails.why_special_img"
              alt="Особенности"
              class="w-full h-full object-cover rounded-[60px]"
              style="box-shadow: 8px 8px 0 0 #FF9500;"
            />
            <div
              v-if="!tourDetails?.why_special_img"
              class="w-full h-full bg-gray-200 rounded-[60px] flex items-center justify-center"
              style="box-shadow: 8px 8px 0 0 #FF9500;"
            >
              <span class="text-gray-500 font-montserrat text-[18px]">Картинка</span>
            </div>
          </div>
          <div class="flex-1 flex flex-col">
            <h2 class="font-alice font-normal text-[36px] text-orange-400 mb-6 uppercase flex items-center gap-3">
              ✨ ПОЧЕМУ ЭТО ОСОБЕННЫЙ ТУР?
              <!-- Кнопка редактирования для администраторов -->
              <button 
                v-if="isAdmin"
                @click="openEditTourDetailsPopup('special')"
                class="bg-blue-500 hover:bg-blue-600 text-white w-[36px] h-[36px] rounded-full transition-colors duration-200 flex items-center justify-center shadow-lg"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
            </h2>
            <FormattedText 
              :html="tourDetails?.why_special || 'Посещение храмов планет и Накшатр для гармонизации жизни. Выполнение пудж для здоровья, процветания и снятия кармических блоков. Йога у океана и медитации в священных местах. Посещение Ауровиля и Пондичерри.'"
              text-class="text-gray-700 font-montserrat font-normal text-[23px] md:text-[35px] leading-[1.2]"
            />
          </div>
        </div>

        <!-- Секция ПРОГРАММА ТУРА и ГАЛЕРЕЯ рядом -->
        <div class="flex flex-col lg:flex-row gap-[30px]">
          <!-- Программа тура (аккордеон) -->
          <div class="flex-1 min-w-0">
            <div class="mb-6">
              <h2 class="font-alice font-normal text-[36px] text-orange-400 uppercase">ПРОГРАММА ТУРА</h2>
            </div>
            <div class="flex flex-col gap-[10px]">
              <!-- Loading State для дней тура -->
              <div v-if="detailsLoading" class="text-center py-8">
                <div class="text-orange-400 text-xl font-montserrat">Загрузка программы тура...</div>
              </div>

              <!-- Error State для дней тура -->
              <div v-else-if="detailsError" class="text-center py-8">
                <div class="text-red-500 text-xl font-montserrat">Ошибка загрузки программы тура</div>
                <div class="text-red-400 text-sm mt-2">{{ detailsError }}</div>
              </div>

              <!-- No Data State для дней тура -->
              <div v-else-if="!tourDays || tourDays.length === 0" class="text-center py-8">
                <div class="text-orange-400 text-xl font-montserrat mb-4">Программа тура пока не добавлена</div>
                
                <!-- Кнопка добавления дня для администраторов -->
                <button 
                  v-if="isAdmin"
                  @click="openAddTourDayPopup"
                  class="inline-flex items-center justify-center px-[30px] py-[15px] bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <svg class="w-7 h-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  добавить первый день тура
                </button>
              </div>

              <!-- Кнопка добавления дня тура над первым днем для администраторов -->
              <div v-if="isAdmin && tourDays && tourDays.length > 0" class="mb-4">
                <button 
                  @click="openAddTourDayPopup"
                  class="w-full inline-flex items-center justify-center px-[30px] py-[15px] bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <svg class="w-7 h-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  добавить день тура
                </button>
              </div>

              <!-- Дни тура из базы данных -->
              <div v-if="tourDays && tourDays.length > 0" v-for="(item, idx) in tourDays" :key="item.id">
                <div class="relative">
                  <!-- Админ кнопки редактирования и удаления -->
                  <div v-if="isAdmin" class="absolute top-4 right-2 z-20 flex gap-1">
                    <button
                      @click.stop="openEditTourDayPopup(item)"
                      class="bg-blue-500 hover:bg-blue-600 text-white w-[36px] h-[36px] rounded-full transition-colors duration-200 flex items-center justify-center shadow-lg"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      @click.stop="confirmDeleteTourDay(item)"
                      class="bg-red-500 hover:bg-red-600 text-white w-[36px] h-[36px] rounded-full transition-colors duration-200 flex items-center justify-center shadow-lg"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                  
                  <button
                    @click="openIndex = openIndex === idx ? null : idx"
                    class="w-full flex items-center px-6 py-4 border-2 border-orange-400 rounded-[60px] font-montserrat font-medium text-[28px] text-left transition relative z-10 border-b-2 pl-[88px]"
                    :class="[
                      openIndex === idx ? 'bg-white' : 'bg-[#FFFCF5]',
                      openIndex === idx ? '' : '[box-shadow:0_4px_4px_0_rgba(0,0,0,0.25)]'
                    ]"
                    type="button"
                  >
                  <span class="absolute left-[3px] top-[3px] pointer-events-none" :style="{height: 'calc(100% - 6px)'}">
                    <svg :height="'100%'" :width="'100%'" viewBox="0 0 34 34" fill="none">
                      <circle cx="17" cy="17" r="16" stroke="#FF9500" stroke-width="1"/>
                      <path v-if="openIndex === idx" d="M10 20L17 13L24 20" stroke="#FF9500" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                      <path v-else d="M10 14L17 21L24 14" stroke="#FF9500" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <span class="font-montserrat font-medium text-[28px] text-black flex items-center">{{ item.title }}</span>
                </button>
                <Collapse :when="openIndex === idx">
                  <div
                    class="border-2 border-orange-400 rounded-b-[60px] bg-white px-8 pt-16 py-8 flex flex-col md:flex-row gap-8 items-center -mt-10 relative z-0 border-t-0"
                  >
                    <!-- Изображение дня, если есть -->
                    <GoogleDriveImage 
                      v-if="item.image_url" 
                      :src="item.image_url" 
                      :alt="item.title"
                      class="w-28 h-28 object-cover flex-shrink-0"
                    />
                    <!-- Иконка по умолчанию, если нет изображения -->
                    <svg v-else class="w-28 h-28 text-orange-400 flex-shrink-0" fill="none" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="30" stroke="#FF9500" stroke-width="2" fill="none"/>
                      <path d="M16 32L28 20L48 40" stroke="#FF9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <FormattedText 
                      :html="item.description"
                      text-class="font-montserrat text-[18px] md:text-[28px] text-black leading-[1.2]"
                    />
                  </div>
                </Collapse>
              </div>
            </div>
          </div>
          </div>
          <!-- Галерея -->
          <div class="flex-1 min-w-0">
            <!-- Loading State для галереи -->
            <div v-if="detailsLoading" class="text-center py-8">
              <div class="text-orange-400 text-xl font-montserrat">Загрузка галереи...</div>
            </div>

            <!-- Error State для галереи -->
            <div v-else-if="detailsError" class="text-center py-8">
              <div class="text-red-500 text-xl font-montserrat">Ошибка загрузки галереи</div>
              <div class="text-red-400 text-sm mt-2">{{ detailsError }}</div>
            </div>

            <!-- No Data State для галереи -->
            <div v-else-if="!tourImages || tourImages.length === 0" class="text-center py-8">
              <div class="text-orange-400 text-xl font-montserrat mb-4">Галерея пока не добавлена</div>
              
              <!-- Кнопка добавления изображения для администраторов -->
              <div v-if="isAdmin" class="flex justify-center">
                <button 
                  @click="openAddTourImagePopup"
                  class="w-48 h-48 bg-white hover:bg-gray-50 text-green-600 rounded-[60px] transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl border-2 border-green-500"
                  style="box-shadow: 8px 8px 0 0 #16a34a;"
                >
                  <div class="text-center">
                    <svg class="w-16 h-16 mx-auto mb-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <span class="text-lg font-montserrat font-medium text-green-600">Добавить изображение</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Галерея из базы данных -->
            <div v-else class="grid grid-cols-2 gap-0">
              <!-- Кнопка добавления изображения для администраторов -->
              <div v-if="isAdmin" class="relative">
                <button 
                  @click="openAddTourImagePopup"
                  class="w-full aspect-square bg-white hover:bg-gray-50 text-green-600 rounded-[60px] transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl border-2 border-green-500"
                  style="box-shadow: 8px 8px 0 0 #16a34a;"
                >
                  <div class="text-center">
                    <svg class="w-12 h-12 mx-auto mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <span class="text-sm font-montserrat font-medium text-green-600">Добавить</span>
                  </div>
                </button>
              </div>
              
              <div v-for="(image, idx) in tourImages" :key="image.id" class="relative">
                <!-- Админ кнопки редактирования и удаления -->
                <div v-if="isAdmin" class="absolute top-[10px] left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                  <button
                    @click.stop="openEditTourImagePopup(image)"
                    class="bg-blue-500 hover:bg-blue-600 text-white w-[36px] h-[36px] rounded-full transition-colors duration-200 flex items-center justify-center shadow-lg"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    @click.stop="confirmDeleteTourImage(image)"
                    class="bg-red-500 hover:bg-red-600 text-white w-[36px] h-[36px] rounded-full transition-colors duration-200 flex items-center justify-center shadow-lg"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
                
                <GoogleDriveImage 
                  :src="image.image_url" 
                  :alt="image.title || `Фото ${idx+1}`"
                  class="w-full aspect-square object-cover rounded-[60px] cursor-pointer"
                  style="box-shadow: 8px 8px 0 0 #ff9900;"
                  width="600" height="600"
                  @click="openImage(idx)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Кнопка бронирования внизу -->
    <section class="px-4 md:px-[100px] pb-[50px] text-center relative">
      <div class="inline-block relative">
        <button
          @click.stop="openBookingForm"
          :disabled="loading || !tour?.id"
          class="relative z-10 border-4 border-orange-400 rounded-full font-montserrat font-bold text-[27px] text-orange-400 uppercase tracking-wide shadow-none outline-none select-none transition-all duration-200 px-[30px] py-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
          @mouseover="hoveredBtn = true"
          @mouseleave="hoveredBtn = false"
          :style="hoveredBtn ? 'box-shadow: none; background: #fff;' : 'box-shadow: 8px 8px 0 0 #ff9900; background: #FFFCF5;'"
        >
          {{ loading ? 'Загрузка...' : 'ЗАБРОНИРОВАТЬ МЕСТО' }}
        </button>
      </div>
    </section>
    <div v-if="fullscreenImage !== null && tourImages && tourImages[fullscreenImage]" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 cursor-zoom-out" @click="closeImage">
      <GoogleDriveImage 
        :src="tourImages[fullscreenImage].image_url" 
        class="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain rounded-[20px] shadow-2xl" 
        :alt="tourImages[fullscreenImage].title || `Фото ${fullscreenImage+1}`" 
      />
      <button class="absolute top-6 right-6 text-white text-4xl font-bold bg-black/50 rounded-full w-14 h-14 flex items-center justify-center hover:bg-black/70 transition-colors duration-200" @click.stop="closeImage">&times;</button>
    </div>
    
    <!-- Форма бронирования -->
    <BookingForm
      :item-id="bookingForm.itemId"
      :item-title="bookingForm.itemTitle"
      :item-type="bookingForm.itemType"
      :is-open="bookingForm.isOpen"
      :is-loading="submitLoading"
      @close="closeBookingForm"
      @submit="handleBookingSubmit"
    />

    <!-- Попап для добавления/редактирования tour_info -->
    <AddTourInfoPopup
      v-if="tour && tour.id"
      :is-open="isAddTourInfoPopupOpen"
      :editing-info="editingTourInfo"
      :tour-id="tour.id"
      @close="closeAddTourInfoPopup"
      @added="handleTourInfoAdded"
      @edited="handleTourInfoEdited"
    />

    <!-- Попап для редактирования tour_details -->
    <EditTourDetailsPopup
      v-if="tour && tour.id"
      :is-open="isEditTourDetailsPopupOpen"
      :editing-details="editingTourDetails"
      :tour-id="tour.id"
      :section="editingSection"
      :is-image-edit="isEditingImage"
      @close="closeEditTourDetailsPopup"
      @edited="handleTourDetailsEdited"
    />

    <!-- Попап для добавления/редактирования tour_days -->
    <AddTourDayPopup
      v-if="tour && tour.id"
      :is-open="isAddTourDayPopupOpen"
      :editing-day="editingTourDay"
      :tour-id="tour.id"
      @close="closeAddTourDayPopup"
      @added="handleTourDayAdded"
      @edited="handleTourDayEdited"
    />

    <!-- Попап для добавления/редактирования tour_images -->
    <AddTourImagePopup
      v-if="tour && tour.id"
      :is-open="isAddTourImagePopupOpen"
      :editing-image="editingTourImage"
      :tour-id="tour.id"
      @close="closeAddTourImagePopup"
      @added="handleTourImageAdded"
      @edited="handleTourImageEdited"
    />


  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import tourInfoPopup from '../../components/tourInfoPopup.vue'
import { Collapse } from 'vue-collapsed'
import { useBookingSubmit } from '../../../composables/useBookingSubmit.js'
import { useTourDetails } from '../../../composables/useTourDetails'
import { useAdminCheck } from '../../../composables/useAdminCheck'
import BookingForm from '../../components/BookingForm.vue'
import AddTourInfoPopup from '../../components/AddTourInfoPopup.vue'
import EditTourDetailsPopup from '../../components/EditTourDetailsPopup.vue'
import FormattedText from '../../components/FormattedText.vue'
import AddTourDayPopup from '../../components/AddTourDayPopup.vue'
import AddTourImagePopup from '../../components/AddTourImagePopup.vue'
import GoogleDriveImage from '../../components/GoogleDriveImage.vue'

const route = useRoute()
const tour = ref(null)
const loading = ref(true)
const error = ref(null)
const defaultImage = 'https://cdn.tripzaza.com/ru/destinations/wp-content/uploads/2017/04/India-1-Taj-Mahal-e1492124232509.jpg'

// Состояние для работы с детальной информацией о туре
const { 
  tourDetails, 
  tourInfo, 
  tourDays, 
  tourImages,
  loading: detailsLoading, 
  error: detailsError, 
  fetchTourDetails,
  deleteTourInfo: deleteTourInfoFunc
} = useTourDetails()
const { isAdmin, initAdminCheck } = useAdminCheck()
const tourInfoOpenedPopup = ref(null)

// Состояние для добавления/редактирования tour_info
const isAddTourInfoPopupOpen = ref(false)
const editingTourInfo = ref(null)

// Состояние для редактирования tour_details
const isEditTourDetailsPopupOpen = ref(false)
const editingTourDetails = ref(null)
const editingSection = ref('') // 'about' или 'special'
const isEditingImage = ref(false) // true если редактируем изображение

// Состояние для добавления/редактирования tour_days
const isAddTourDayPopupOpen = ref(false)
const editingTourDay = ref(null)

// Состояние для добавления/редактирования tour_images
const isAddTourImagePopupOpen = ref(false)
const editingTourImage = ref(null)

// Используем composable для отправки заявок
const { submitBooking, loading: submitLoading, error: submitError } = useBookingSubmit()

// Функции для работы с tour_info
const openAddTourInfoPopup = () => {
  editingTourInfo.value = null
  isAddTourInfoPopupOpen.value = true
}

const closeAddTourInfoPopup = () => {
  isAddTourInfoPopupOpen.value = false
  editingTourInfo.value = null
}

const openEditTourInfoPopup = (info) => {
  editingTourInfo.value = { ...info }
  isAddTourInfoPopupOpen.value = true
}

const closeEditTourInfoPopup = () => {
  isAddTourInfoPopupOpen.value = false
  editingTourInfo.value = null
}

const handleTourInfoAdded = async (newInfo) => {
  try {
    await fetchTourDetails(tour.value.id)
    closeAddTourInfoPopup()
  } catch (error) {
    console.error('Ошибка при добавлении информации о туре:', error)
  }
}

const handleTourInfoEdited = async (updatedInfo) => {
  try {
    await fetchTourDetails(tour.value.id)
    closeEditTourInfoPopup()
  } catch (error) {
    console.error('Ошибка при редактировании информации о туре:', error)
  }
}

const confirmDeleteTourInfo = (info) => {
  if (confirm('Вы уверены, что хотите удалить эту информацию?')) {
    deleteTourInfo(info.id)
  }
}

const deleteTourInfo = async (infoId) => {
  try {
    await deleteTourInfoFunc(infoId)
    await fetchTourDetails(tour.value.id)
  } catch (error) {
    console.error('Ошибка при удалении информации о туре:', error)
  }
}

// Функции для работы с tour_details
const openEditTourDetailsPopup = (section) => {
  editingSection.value = section
  isEditingImage.value = false
  editingTourDetails.value = tourDetails.value ? { ...tourDetails.value } : {
    about_tour: '',
    why_special: ''
  }
  isEditTourDetailsPopupOpen.value = true
}

// Функции для работы с изображениями
const openEditImagePopup = (section) => {
  editingSection.value = section
  isEditingImage.value = true
  editingTourDetails.value = tourDetails.value ? { ...tourDetails.value } : {
    about_tour_img: '',
    why_special_img: ''
  }
  isEditTourDetailsPopupOpen.value = true
}

const closeEditTourDetailsPopup = () => {
  isEditTourDetailsPopupOpen.value = false
  editingTourDetails.value = null
  editingSection.value = ''
  isEditingImage.value = false
}

const handleTourDetailsEdited = async (updatedDetails) => {
  try {
    await fetchTourDetails(tour.value.id)
    closeEditTourDetailsPopup()
  } catch (error) {
    console.error('Ошибка при редактировании информации о туре:', error)
  }
}

// Функции для работы с tour_days
const openAddTourDayPopup = () => {
  editingTourDay.value = null
  isAddTourDayPopupOpen.value = true
}

const closeAddTourDayPopup = () => {
  isAddTourDayPopupOpen.value = false
  editingTourDay.value = null
}

const openEditTourDayPopup = (day) => {
  editingTourDay.value = { ...day }
  isAddTourDayPopupOpen.value = true
}

const handleTourDayAdded = async (newDay) => {
  try {
    await fetchTourDetails(tour.value.id)
    closeAddTourDayPopup()
  } catch (error) {
    console.error('Ошибка при добавлении дня тура:', error)
  }
}

const handleTourDayEdited = async (updatedDay) => {
  try {
    await fetchTourDetails(tour.value.id)
    closeAddTourDayPopup()
  } catch (error) {
    console.error('Ошибка при редактировании дня тура:', error)
  }
}

const confirmDeleteTourDay = (day) => {
  if (confirm(`Вы уверены, что хотите удалить день "${day.title}"?`)) {
    deleteTourDay(day)
  }
}

const deleteTourDay = async (day) => {
  try {
    const { deleteTourDay: deleteTourDayFunc } = useTourDetails()
    await deleteTourDayFunc(day.id)
    await fetchTourDetails(tour.value.id)
  } catch (error) {
    console.error('Ошибка при удалении дня тура:', error)
  }
}

// Функции для работы с tour_images
const openAddTourImagePopup = () => {
  editingTourImage.value = null
  isAddTourImagePopupOpen.value = true
}

const closeAddTourImagePopup = () => {
  isAddTourImagePopupOpen.value = false
  editingTourImage.value = null
}

const openEditTourImagePopup = (image) => {
  editingTourImage.value = { ...image }
  isAddTourImagePopupOpen.value = true
}

const handleTourImageAdded = async (newImage) => {
  try {
    await fetchTourDetails(tour.value.id)
    closeAddTourImagePopup()
  } catch (error) {
    console.error('Ошибка при добавлении изображения тура:', error)
  }
}

const handleTourImageEdited = async (updatedImage) => {
  try {
    await fetchTourDetails(tour.value.id)
    closeAddTourImagePopup()
  } catch (error) {
    console.error('Ошибка при редактировании изображения тура:', error)
  }
}

const confirmDeleteTourImage = (image) => {
  if (confirm(`Вы уверены, что хотите удалить изображение "${image.title || 'Без названия'}"?`)) {
    deleteTourImage(image)
  }
}

const deleteTourImage = async (image) => {
  try {
    const { deleteTourImage: deleteTourImageFunc } = useTourDetails()
    await deleteTourImageFunc(image.id)
    await fetchTourDetails(tour.value.id)
  } catch (error) {
    console.error('Ошибка при удалении изображения тура:', error)
  }
}

// Состояние формы бронирования
const bookingForm = ref({
  isOpen: false,
  itemId: '',
  itemTitle: '',
  itemType: 'tour'
})

function formatTourDates(dateFrom, dateTo) {
  if (!dateFrom || !dateTo) return ''
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ]
  const from = new Date(dateFrom)
  const to = new Date(dateTo)
  return `${from.getDate()} ${months[from.getMonth()]} – ${to.getDate()} ${months[to.getMonth()]}`
}

onMounted(async () => {
  try {
    // Инициализируем проверку админа
    await initAdminCheck()
    
    // Загружаем детальную информацию о туре
    if (tour.value && tour.value.id) {
      await fetchTourDetails(tour.value.id)
    }
    
    // Загружаем тур напрямую из Supabase по slug
    const supabase = useSupabaseClient()
    const { data, error: fetchError } = await supabase
      .from('tours')
      .select('*')
      .eq('slug', route.params.slug)
      .single()
    
    if (fetchError) {
      throw fetchError
    }
    
    tour.value = data
    
    // Загружаем детальную информацию о туре
    if (tour.value && tour.value.id) {
      await fetchTourDetails(tour.value.id)
    }
    
    // Проверяем, что у тура есть валидный ID
    if (!tour.value || !tour.value.id) {
      // Если тур не найден в БД, создаем fallback объект
      tour.value = {
        id: '550e8400-e29b-41d4-a716-446655440001', // Валидный UUID
        title: 'Духовное паломничество по храмам Наваграха',
        description: 'Духовное паломничество по храмам Наваграха — это особый тур для очищения, получения высшей поддержки и трансформации судьбы. Индия — это место, где исполняются желания и происходят чудесные изменения в жизни.',
        slug: route.params.slug,
        image_url: defaultImage,
        date_from: '2024-03-01',
        date_to: '2024-03-10'
      }
    }
  } catch (err) {
    error.value = err
    console.error('Ошибка загрузки тура:', err)
    
    // Если тур не найден, создаем fallback
    if (err.code === 'PGRST116') { // No rows returned
      tour.value = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Духовное паломничество по храмам Наваграха',
        description: 'Духовное паломничество по храмам Наваграха — это особый тур для очищения, получения высшей поддержки и трансформации судьбы. Индия — это место, где исполняются желания и происходят чудесные изменения в жизни.',
        slug: route.params.slug,
        image_url: defaultImage,
        date_from: '2024-03-01',
        date_to: '2024-03-10'
      }
      error.value = null // Очищаем ошибку
      
      // Загружаем детальную информацию о туре для fallback
      if (tour.value && tour.value.id) {
        await fetchTourDetails(tour.value.id)
      }
    }
  } finally {
    loading.value = false
  }
})

const infoButtons = [
  {
    label: 'Тёплый океан и Солнце',
    popup: {
      title: 'Тёплый океан и Солнце',
      text: 'Описание для этого пункта...',
      image: ''
    }
  },
  {
    label: 'Храм спящего Вишну',
    popup: {
      title: 'Храм спящего Вишну',
      text: 'Описание для этого пункта...',
      image: ''
    }
  },
  {
    label: 'Храмы Наваграха',
    popup: {
      title: 'Храмы Наваграха',
      text: 'Описание для этого пункта...',
      image: ''
    }
  },
  {
    label: 'Храм Марса',
    popup: {
      title: 'Храм Марса',
      text: 'Описание для этого пункта...',
      image: ''
    }
  },
  {
    label: 'Храм всех Накшатр',
    popup: {
      title: 'Храм всех Накшатр',
      text: 'Описание для этого пункта...',
      image: ''
    }
  },
  {
    label: 'Храм Ретро Планет',
    popup: {
      title: 'Храм Ретро Планет',
      text: 'Описание для этого пункта...',
      image: ''
    }
  },
]


const openIndex = ref(0)

// Создаем computed для галереи изображений из базы данных
const galleryImages = computed(() => {
  return tourImages.value.map(image => image.image_url)
})
const fullscreenImage = ref(null)

function openImage(idx) { 
  if (idx >= 0 && idx < galleryImages.value.length) {
    fullscreenImage.value = idx 
    // Добавляем обработчик клавиши Escape
    document.addEventListener('keydown', handleEscapeKey)
  }
}

function closeImage() { 
  fullscreenImage.value = null 
  // Удаляем обработчик клавиши Escape
  document.removeEventListener('keydown', handleEscapeKey)
}

function handleEscapeKey(event) {
  if (event.key === 'Escape') {
    closeImage()
  }
}
const hoveredBtn = ref(false)

// Функции для работы с формой бронирования
const openBookingForm = () => {
  if (tour.value && tour.value.id) {
    bookingForm.value = {
      isOpen: true,
      itemId: tour.value.id,
      itemTitle: tour.value.title || 'Духовное паломничество по храмам Наваграха',
      itemType: 'tour'
    }
  } else {
    // Если тур не загружен, не открываем форму
    alert('Данные тура загружаются. Попробуйте еще раз через несколько секунд.')
  }
}

const closeBookingForm = () => {
  bookingForm.value.isOpen = false
}



const handleBookingSubmit = async (bookingData) => {
  try {
    await submitBooking(bookingData)
    
    // Показываем уведомление об успехе
    alert('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.')
  } catch (error) {
    console.error('Ошибка при отправке заявки:', error)
    alert('Произошла ошибка при отправке заявки. Попробуйте еще раз.')
  }
}

// Функции для работы с детальной информацией о туре будут добавлены позже

// Очистка обработчиков при размонтировании компонента
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
})
</script>

<style scoped>
/* Удаляю transition-стили для аккордеона, Collapse сам анимирует высоту */
button[aria-expanded] {
  position: relative;
  z-index: 10;
}
</style> 