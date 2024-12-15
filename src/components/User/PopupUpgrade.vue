<template>
    <div v-if="isOpen" class="popup-overlay">
        <div class="popup-content">
            <button class="close-btn" @click="closePopup">&times;</button>
            <h2 class="popup-title">Upgrade Your Experience</h2>
            <div class="plans-container">
                <!-- Classic Plan -->
                <div class="plan-card classic">
                    <h3 class="plan-title"><i class="fa fa-user"></i> CLASSIC</h3>
                    <p class="price">Free</p>
                    <ul class="features">
                        <li><i class="bi bi-person-workspace"></i> 1 Workspace</li>
                        <li><i class="bi bi-clipboard2-fill"></i>Below 3 Boards</li>
                        <li><i class="fa fa-id-badge"></i> No Special Badge</li>
                    </ul>
                    <button class="subscribe-btn" disabled>Current Plan</button>
                </div>

                <!-- VIP Plan -->
                <div class="plan-card vip">
                    <h3 class="plan-title"><i class="fa fa-star"></i> VIP</h3>
                    <p class="price"><span>49,000₫</span> / Month</p>
                    <ul class="features">
                        <li><i class="bi bi-person-workspace"></i> More than 1 Workspace</li>
                        <li><i class="bi bi-clipboard2-fill"></i> More than 3 Boards</li>
                        <li><i class="fa fa-crown"></i> Special VIP Badge</li>
                        <li><i class="fa fa-video"></i> VideoCall in HD</li>
                        <li></li>
                    </ul>
                    <button class="subscribe-btn" @click="upgradeToVip">Upgrade Now</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { useToast } from "vue-toastification";

export default {
    props: {
        isOpen: {
            type: Boolean,
            required: true,
        },
    },
    methods: {
        closePopup() {
            this.$emit("close");
        },
        async upgradeToVip() {
            const toast = useToast(); // Optional: Hiển thị thông báo
            try {
                const response = await axios.post(
                    `${process.env.VUE_APP_API_BASE_URL}/api/payment/upgrade-vip`,
                    {},
                    {
                        headers: {
                            UserId: localStorage.getItem("userId"),
                        },
                    }
                );
                if (response.data.checkoutUrl) {

                    window.location.href = response.data.checkoutUrl;
                } else {
                    toast.error("Failed to create payment link.");
                }
            } catch (error) {
                console.error("Error upgrading to VIP:", error);
                toast.error("An error occurred while processing your request.");
            }
        },

    },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap");

.popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.popup-content {
    background: #ffffff;
    padding: 40px;
    border-radius: 20px;
    width: 850px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
}

.close-btn {
    align-self: flex-end;
    background: none;
    border: none;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    color: #555;
    transition: color 0.3s ease;
}

.close-btn:hover {
    color: #ff4d4d;
}

.popup-title {
    font-size: 28px;
    font-weight: 700;
    font-family: "Poppins", sans-serif;
    color: #333;
    margin-bottom: 30px;
    text-align: center;
    line-height: 1.5;
}

.plans-container {
    display: flex;
    gap: 30px;
    justify-content: space-between;
}

.plan-card {
    flex: 1;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    word-wrap: break-word;
    justify-content: space-between;
    
}

.plan-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
}

.plan-title {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 10px;
    font-family: "Poppins", sans-serif;
    color: #ffffff;
    line-height: 1.5;
    word-wrap: break-word;
}

.plan-title i {
    margin-right: 8px;
    color: #ffd700;
}

.price {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    font-family: "Poppins", sans-serif;
}

.price span {
    color: #ffd700;
    font-size: 26px;
    font-weight: 700;
}

.features {
    list-style: none;
    padding: 0;
    margin: 0 0 20px 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.features li {
    margin-bottom: 10px;
    font-size: 14px;
    font-family: "Poppins", sans-serif;
    display: flex;
    align-items: center;
    color: #ffffff;
    line-height: 1.5;
    text-align: left;
    
}

.features li i {
    font-size: 18px;
    color: white;
    
    margin-right: 10px;
    
    flex-shrink: 0;
    
}

.plan-card ul {
    padding: 0;
    margin: 0 0 20px 0;
    list-style: none;
}

.classic {
    background: linear-gradient(145deg, #00b4ff, #0052cc);
    border: 2px solid #ddd;
}

.vip {
    background: linear-gradient(135deg, #a05ae6, #d35cc3);
}

.vip .features li i {
    color: #ffd700;
}

.subscribe-btn {
    padding: 12px 30px;
    border: none;
    border-radius: 30px;
    font-weight: 700;
    cursor: pointer;
    background: #ffd700;
    color: white;
    transition: all 0.3s ease;
    font-family: "Poppins", sans-serif;
    font-size: 14px;
    margin-top: auto;
    
}

.subscribe-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.subscribe-btn:hover:not(:disabled) {
    background: #e64a19;
    transform: scale(1.05);
}
</style>