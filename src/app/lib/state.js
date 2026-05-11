const State = {
  data: { users: [], user: null },

  load() {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("qcare");
    this.data = raw ? JSON.parse(raw) : { users: [], user: null };
  },

  save() {
    localStorage.setItem("qcare", JSON.stringify(this.data));
  },
};

export default State;