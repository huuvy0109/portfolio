# Memory — Lessons Learned

## Team Size & Roles
- **Team size**: 4 agents
- **Roles**: PO, BA, DEV, QC

## Session thất bại: Dashboard Redesign (2026-04-21)

### Tóm tắt
Full Mode redesign 6 file dashboard "theo style portfolio" — kết quả UI gần như không thay đổi so với trước. User thất vọng, yêu cầu revert toàn bộ.

---

## Bottleneck & Giải pháp

### 1. "Redesign" không có definition rõ ràng
**Nguyên nhân:** Confirm scope "redesign theo style portfolio" mà không hỏi rõ redesign = thay gì cụ thể. Tự assume "dùng đúng CSS vars" = xong.

**Giải pháp:** Trước khi plan bất kỳ UI task nào, bắt buộc hỏi:
- Redesign nghĩa là thay variable/color? Thay layout structure? Thay toàn bộ component HTML?
- UI sau khi xong phải khác gì so với hiện tại — từng phần cụ thể?
- **Không được assume. Không được implement khi chưa có answer.**

---

### 2. Không có visual baseline & acceptance criteria
**Nguyên nhân:** Không xem/chụp screenshot before, không mô tả "after" cụ thể trong plan. Plan chỉ liệt kê file sẽ sửa, không mô tả UI sẽ trông như thế nào.

**Giải pháp:** Plan cho UI task BẮT BUỘC phải có:
1. Mô tả UI hiện tại đang trông như thế nào (based on screenshot user gửi)
2. Mô tả cụ thể UI sau khi xong sẽ khác gì — từng component, spacing, color, layout structure
3. **Nếu không viết được mô tả này → không được implement**

---

### 3. Agent QC pass nhưng visual không thay đổi
**Nguyên nhân:** Playwright chỉ verify element tồn tại/click được, không verify visual quality. 54/54 PASS không có nghĩa là redesign thành công.

**Giải pháp:** Với mọi UI redesign task, CONFIRM 2 BẮT BUỘC phải có:
- Screenshot thực tế từ browser sau khi implement
- User phải approve visual — không chỉ approve test pass
- Nếu không mở browser kiểm tra → không được trình CONFIRM 2

---

### 4. Revert sai scope
**Nguyên nhân:** Khi user yêu cầu revert, revert toàn bộ kể cả workflow.md — là file rule do user yêu cầu thêm, không liên quan code.

**Giải pháp:** Khi revert:
- Liệt kê rõ từng file sẽ revert và lý do cụ thể
- Hỏi confirm trước khi chạy lệnh
- Rule files (.claude/rules/), workflow, memory → KHÔNG revert trừ khi user chỉ định rõ tên file đó
